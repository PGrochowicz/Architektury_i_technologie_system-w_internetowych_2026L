import base64
import io
import os
import uuid
from pathlib import Path

import pyodbc
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from minio import Minio

from routes.auth import getUserFromCookie, requireAdmin
from routes.helpers.db import get_db
from routes.photos.models import AdminPhotoPageOut, CreatePhotoBody, PhotoPageOut, UpdatePhotoBody

MINIO_BUCKET = os.environ["MINIO_BUCKET"]
minio_client = Minio(
    os.environ["MINIO_ENDPOINT"],
    access_key=os.environ["MINIO_ACCESS_KEY"],
    secret_key=os.environ["MINIO_SECRET_KEY"],
    secure=False,
)

router = APIRouter(prefix="/photos", tags=["Zdjęcia"])

MAX_TAGS_PER_PHOTO = 5
ALLOWED_EXT = {".jpg", ".jpeg", ".png"}


def getFileExtension(name: str) -> str:
    e = (Path(name).suffix or "").lower()
    return e if e in ALLOWED_EXT else ".jpg"


def normalizeTags(tags) -> list[str]:
    out = []
    for t in tags or []:
        t = (t or "").strip()
        if t:
            out.append(t.lower())
    return out


def resolveCity(cursor, cityId, customCityName, voivodeshipId):
    if customCityName and customCityName.strip():
        if not voivodeshipId:
            raise HTTPException(status_code=422, detail="Voivodeship required for custom city")
        name = customCityName.strip()
        row = cursor.execute(
            "SELECT Id FROM Cities WHERE Name = ? AND VoivodeshipId = ?", (name, voivodeshipId)
        ).fetchone()
        if row:
            return int(row[0])
        row = cursor.execute(
            "INSERT INTO Cities (Name, VoivodeshipId) OUTPUT INSERTED.Id VALUES (?, ?)",
            (name, voivodeshipId),
        ).fetchone()
        return int(row[0])
    if not cityId or cityId <= 0:
        raise HTTPException(status_code=422, detail="Valid city or custom city name required")
    return cityId


def decodeDataUrl(data_url: str) -> bytes:
    _, data = data_url.split(",", 1)
    return base64.b64decode(data)


def buildWhereClause(parts, prm, voivodeshipId, cityId, dateFrom, dateTo, tags, description=None):
    if voivodeshipId is not None:
        parts.append("v.Id = ?")
        prm.append(voivodeshipId)
    if cityId is not None:
        parts.append("p.CityId = ?")
        prm.append(cityId)

    if dateFrom or dateTo:
        clause = []
        if dateFrom:
            clause.append("DATEFROMPARTS(p.TakenYear, COALESCE(p.TakenMonth, 12), COALESCE(p.TakenDay, 31)) >= CAST(? AS DATE)")
            prm.append(dateFrom)
        if dateTo:
            clause.append("DATEFROMPARTS(p.TakenYear, COALESCE(p.TakenMonth, 12), COALESCE(p.TakenDay, 31)) <= CAST(? AS DATE)")
            prm.append(dateTo)
        parts.append("(p.TakenYear IS NULL OR (" + " AND ".join(clause) + "))")

    if description and description.strip():
        parts.append("LOWER(p.Description) LIKE ?")
        prm.append(f"%{description.strip().lower()}%")

    normalizedTags = normalizeTags(tags)
    if normalizedTags:
        n = len(normalizedTags)
        ph = ",".join("?" * n)
        parts.append(
            f"""p.Id IN (
            SELECT pt.PhotoId FROM PhotoTags pt
            LEFT JOIN Tags t ON pt.TagId = t.Id
            WHERE LOWER(t.Name) IN ({ph})
            GROUP BY pt.PhotoId
            HAVING COUNT(DISTINCT LOWER(t.Name)) = ?)"""
        )
        prm.extend(normalizedTags)
        prm.append(n)


@router.get("/logged", response_model=PhotoPageOut)
def getLogged(
    request: Request,
    voivodeshipId: int | None = Query(None),
    cityId: int | None = Query(None),
    dateFrom: str | None = Query(None),
    dateTo: str | None = Query(None),
    tags: list[str] = Query(default=[]),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=50),
    db: pyodbc.Connection = Depends(get_db),
):
    u = getUserFromCookie(request)
    if not u:
        raise HTTPException(status_code=401, detail="Authentication required")

    cursor = db.cursor()
    parts, prm = ["p.CreatedByUserId = ?"], [u.user_id]
    buildWhereClause(parts, prm, voivodeshipId, cityId, dateFrom, dateTo, tags)
    whereClause = " AND ".join(parts)

    try:
        counterResult = cursor.execute(f"""SELECT COUNT(*)
            FROM Photos p
            LEFT JOIN Cities c ON p.CityId = c.Id
            LEFT JOIN Voivodeships v ON c.VoivodeshipId = v.Id
            WHERE {whereClause}""", tuple(prm)).fetchone()
        total = int(counterResult[0] or 0)

        offset = (max(1, page) - 1) * pageSize
        result = cursor.execute(
            f"""SELECT p.Id, p.CityId, p.Description, p.StoredFileName,
            p.TakenYear, p.TakenMonth, p.TakenDay, v.Name, c.Name, t.Name
            FROM Photos p
            LEFT JOIN Cities c ON p.CityId = c.Id
            LEFT JOIN Voivodeships v ON c.VoivodeshipId = v.Id
            LEFT JOIN PhotoTags pt ON pt.PhotoId = p.Id
            LEFT JOIN Tags t ON t.Id = pt.TagId
            WHERE {whereClause}
            ORDER BY p.CreatedAt DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY""",
            tuple(prm + [offset, pageSize]),
        ).fetchall()
        photos = {}
        for r in result:
            photo_id = int(r[0])

            if photo_id not in photos:
                photos[photo_id] = {
                "id": photo_id,
                "cityId": int(r[1]),
                "description": str(r[2] or ""),
                "storedFileName": str(r[3] or ""),
                "takenYear": None if r[4] is None else int(r[4]),
                "takenMonth": None if r[5] is None else int(r[5]),
                "takenDay": None if r[6] is None else int(r[6]),
                "voivodeshipName": str(r[7] or ""),
                "cityName": str(r[8] or ""),
                "tags": [],
            }

            tag_name = r[9]
            if tag_name and tag_name not in photos[photo_id]["tags"]:
                photos[photo_id]["tags"].append(tag_name)
        return {"items": list(photos.values()), "total": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin", response_model=AdminPhotoPageOut)
def getAdminRecent(
    request: Request,
    userId: int | None = Query(None),
    voivodeshipId: int | None = Query(None),
    cityId: int | None = Query(None),
    dateFrom: str | None = Query(None),
    dateTo: str | None = Query(None),
    tags: list[str] = Query(default=[]),
    isSinceLastLoginChecked: bool = Query(False),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=50),
    db: pyodbc.Connection = Depends(get_db),
):
    cu = getUserFromCookie(request)
    requireAdmin(cu)

    cursor = db.cursor()
    parts, prm = [], []
    if isSinceLastLoginChecked and cu.previousLoginAt:
        parts.append("p.CreatedAt >= ?")
        prm.append(cu.previousLoginAt)
    if userId is not None:
        parts.append("p.CreatedByUserId = ?")
        prm.append(userId)
    buildWhereClause(parts, prm, voivodeshipId, cityId, dateFrom, dateTo, tags)
    whereClause = " AND ".join(parts) if parts else "1 = 1"

    try:
        counterResult = cursor.execute(f"""SELECT COUNT(*)
            FROM Photos p
            LEFT JOIN Cities c ON p.CityId = c.Id
            LEFT JOIN Voivodeships v ON c.VoivodeshipId = v.Id
            LEFT JOIN Users u ON p.CreatedByUserId = u.Id
            WHERE {whereClause}""", tuple(prm)).fetchone()
        total = int(counterResult[0] or 0)

        offset = (max(1, page) - 1) * pageSize
        result = cursor.execute(
            f"""SELECT p.Id, p.CityId, p.Description, p.StoredFileName,
            p.TakenYear, p.TakenMonth, p.TakenDay, v.Name, c.Name, t.Name,
            p.CreatedByUserId, u.DisplayName, u.IsActive
            FROM Photos p
            LEFT JOIN Cities c ON p.CityId = c.Id
            LEFT JOIN Voivodeships v ON c.VoivodeshipId = v.Id
            LEFT JOIN Users u ON p.CreatedByUserId = u.Id
            LEFT JOIN PhotoTags pt ON pt.PhotoId = p.Id
            LEFT JOIN Tags t ON t.Id = pt.TagId
            WHERE {whereClause}
            ORDER BY p.CreatedAt DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY""",
            tuple(prm + [offset, pageSize]),
        ).fetchall()
        photos = {}
        for r in result:
            photo_id = int(r[0])

            if photo_id not in photos:
                photos[photo_id] = {
                "id": photo_id,
                "cityId": int(r[1]),
                "description": str(r[2] or ""),
                "storedFileName": str(r[3] or ""),
                "takenYear": None if r[4] is None else int(r[4]),
                "takenMonth": None if r[5] is None else int(r[5]),
                "takenDay": None if r[6] is None else int(r[6]),
                "voivodeshipName": str(r[7] or ""),
                "cityName": str(r[8] or ""),
                "tags": [],
                "createdByUserId": int(r[10]),
                "createdByDisplayName": str(r[11] or ""),
                "createdByIsActive": bool(r[12]),
            }

            tag_name = r[9]
            if tag_name and tag_name not in photos[photo_id]["tags"]:
                photos[photo_id]["tags"].append(tag_name)
        return {"items": list(photos.values()), "total": total}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
def add(
    request: Request,
    body: CreatePhotoBody,
    db: pyodbc.Connection = Depends(get_db),
):
    if not body.file.startswith("data:image/"):
        raise HTTPException(status_code=422, detail="Invalid or missing image file")
    cu = getUserFromCookie(request)
    if not cu:
        raise HTTPException(status_code=401, detail="Authentication required")

    tags = normalizeTags(body.tags)
    if len(tags) > MAX_TAGS_PER_PHOTO:
        raise HTTPException(status_code=422, detail=f"Maximum {MAX_TAGS_PER_PHOTO} tags per photo")

    stored = f"{uuid.uuid4()}{getFileExtension(body.fileName)}"
    data = decodeDataUrl(body.file)

    try:
        minio_client.put_object(MINIO_BUCKET, stored, io.BytesIO(data), len(data))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        cursor = db.cursor()
        actualCityId = resolveCity(cursor, body.cityId, body.customCityName, body.voivodeshipId)
        result = cursor.execute(
            """INSERT INTO Photos (CityId, Description, StoredFileName,
            TakenYear, TakenMonth, TakenDay, CreatedByUserId)
            OUTPUT INSERTED.Id VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (actualCityId, body.description.strip(), stored,
             body.takenYear,
             body.takenMonth if body.takenMonth is not None and 1 <= body.takenMonth <= 12 else None,
             body.takenDay if body.takenDay is not None and 1 <= body.takenDay <= 31 else None,
             cu.user_id),
        ).fetchone()
        pid = int(result[0])
        for tag in tags:
            tagRow = cursor.execute("SELECT Id FROM Tags WHERE Name = ?", (tag,)).fetchone()
            if not tagRow:
                raise HTTPException(status_code=400, detail=f"Unknown tag: {tag}")
            cursor.execute("INSERT INTO PhotoTags (PhotoId, TagId) VALUES (?, ?)", (pid, int(tagRow[0])))
        db.commit()
        return "Successfully added"
    except HTTPException:
        raise
    except Exception as e:
        try:
            minio_client.remove_object(MINIO_BUCKET, stored)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{photo_id}")
def update(
    photo_id: int,
    request: Request,
    body: UpdatePhotoBody,
    db: pyodbc.Connection = Depends(get_db),
):
    cu = getUserFromCookie(request)
    if not cu:
        raise HTTPException(status_code=401, detail="Authentication required")

    normalizedTags = normalizeTags(body.tags) if body.tags is not None else None
    if normalizedTags is not None and len(normalizedTags) > MAX_TAGS_PER_PHOTO:
        raise HTTPException(status_code=422, detail=f"Maximum {MAX_TAGS_PER_PHOTO} tags per photo")

    cursor = db.cursor()
    try:
        row = cursor.execute("SELECT StoredFileName, CreatedByUserId FROM Photos WHERE Id = ?", (photo_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Photo not found")

        if int(row[1]) != cu.user_id and "Admin" not in (cu.roles or []):
            raise HTTPException(status_code=404, detail="Photo not found")

        if body.file:
            data = decodeDataUrl(body.file)
            minio_client.put_object(MINIO_BUCKET, row[0], io.BytesIO(data), len(data))

        actualCityId = resolveCity(cursor, body.cityId, body.customCityName, body.voivodeshipId)
        cursor.execute(
            """UPDATE Photos SET CityId = ?, Description = ?, TakenYear = ?, TakenMonth = ?, TakenDay = ? WHERE Id = ?""",
            (actualCityId, body.description.strip(), body.takenYear,
             body.takenMonth if body.takenMonth is not None and 1 <= body.takenMonth <= 12 else None,
             body.takenDay if body.takenDay is not None and 1 <= body.takenDay <= 31 else None,
             photo_id),
        )
        if normalizedTags is not None:
            cursor.execute("DELETE FROM PhotoTags WHERE PhotoId = ?", (photo_id,))
            for tag in normalizedTags:
                tagRow = cursor.execute("SELECT Id FROM Tags WHERE Name = ?", (tag,)).fetchone()
                if not tagRow:
                    raise HTTPException(status_code=400, detail=f"Unknown tag: {tag}")
                cursor.execute("INSERT INTO PhotoTags (PhotoId, TagId) VALUES (?, ?)", (photo_id, int(tagRow[0])))
        db.commit()
        return "Successfully updated"
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{photo_id}")
def delete(
    photo_id: int,
    request: Request,
    db: pyodbc.Connection = Depends(get_db),
):
    cu = getUserFromCookie(request)
    if not cu:
        raise HTTPException(status_code=401, detail="Authentication required")

    cursor = db.cursor()
    try:
        response = cursor.execute("SELECT StoredFileName, CreatedByUserId FROM Photos WHERE Id = ?", (photo_id,)).fetchone()
        if not response:
            raise HTTPException(status_code=404, detail="Photo not found")

        if int(response[1]) != cu.user_id and "Admin" not in (cu.roles or []):
            raise HTTPException(status_code=404, detail="Photo not found")

        stored = response[0]
        cursor.execute("DELETE FROM Photos WHERE Id = ?", (photo_id,))
        db.commit()

        try:
            minio_client.remove_object(MINIO_BUCKET, stored)
        except Exception:
            pass
        return "Successfully deleted"
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
