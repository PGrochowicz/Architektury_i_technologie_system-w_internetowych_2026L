import pyodbc

from fastapi import APIRouter, Depends, HTTPException, Query

from routes.helpers.db import get_db
from routes.helpers.models import swaggerErrorResponses
from routes.photos.models import PhotoPageOut
from routes.photos.photo import buildWhereClause

router = APIRouter(
    prefix="/photos",
    tags=["Public API"],
)


@router.get("",
    response_model=PhotoPageOut,
    summary="Wyszukiwanie zdjęć (publiczne)",
    description="""
    Publiczny endpoint do wyszukiwania zdjęć od aktywnych użytkowników.
    Opcjonalne filtry: województwo, miasto, fraza w opisie, zakres dat, tagi.
    """,
    responses=swaggerErrorResponses)
def searchPhotos(
    voivodeshipId: int | None = Query(None),
    cityId: int | None = Query(None),
    text: str | None = Query(None),
    dateFrom: str | None = Query(None),
    dateTo: str | None = Query(None),
    tags: list[str] = Query(default=[]),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=50),
    db: pyodbc.Connection = Depends(get_db),
):
    cursor = db.cursor()
    parts, prm = [], []
    buildWhereClause(parts, prm, voivodeshipId, cityId, dateFrom, dateTo, tags, description=text)
    whereClause = " AND ".join(parts) if parts else "1 = 1"

    try:
        countResult = cursor.execute(f"""SELECT COUNT(*)
            FROM Photos p
            INNER JOIN Cities c ON p.CityId = c.Id
            INNER JOIN Voivodeships v ON c.VoivodeshipId = v.Id
            INNER JOIN Users u ON p.CreatedByUserId = u.Id AND u.IsActive = 1
            WHERE {whereClause}""", tuple(prm)).fetchone()
        total = int(countResult[0] or 0)

        offset = (max(1, page) - 1) * pageSize
        result = cursor.execute(
            f"""SELECT p.Id, p.CityId, p.Description, p.StoredFileName,
            p.TakenYear, p.TakenMonth, p.TakenDay, v.Name, c.Name, t.Name
            FROM Photos p
            INNER JOIN Cities c ON p.CityId = c.Id
            INNER JOIN Voivodeships v ON c.VoivodeshipId = v.Id
            INNER JOIN Users u ON p.CreatedByUserId = u.Id AND u.IsActive = 1
            INNER JOIN PhotoTags pt ON pt.PhotoId = p.Id
            INNER JOIN Tags t ON t.Id = pt.TagId
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
