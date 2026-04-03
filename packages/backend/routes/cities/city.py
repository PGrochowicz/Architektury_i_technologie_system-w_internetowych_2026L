import pyodbc

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request

from routes.auth import getUserFromCookie, requireAdmin
from routes.cities.models import CityOut
from routes.helpers.db import get_db

router = APIRouter(
    prefix="/cities",
    tags=["Miasta"],
)


@router.get("", response_model=list[CityOut])
def getAll(
    voivodeshipId: int = Query(...),
    db: pyodbc.Connection = Depends(get_db),
):
    try:
        cursor = db.cursor()
        cursor.execute(
            "SELECT Id, Name FROM Cities WHERE VoivodeshipId = ? ORDER BY Name",
            (voivodeshipId,),
        )
        return [{"id": r[0], "name": r[1]} for r in cursor.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all")
def getAllAdmin(
    request: Request,
    db: pyodbc.Connection = Depends(get_db),
):
    requireAdmin(getUserFromCookie(request))
    try:
        cursor = db.cursor()
        cursor.execute(
            """SELECT c.Id, c.Name, v.Name
            FROM Cities c
            LEFT JOIN Voivodeships v ON c.VoivodeshipId = v.Id
            ORDER BY v.Name, c.Name"""
        )
        return [{"id": r[0], "name": r[1], "voivodeshipName": r[2] or ""} for r in cursor.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{city_id}")
def renameCity(
    city_id: int,
    request: Request,
    name: str = Body(..., embed=True),
    db: pyodbc.Connection = Depends(get_db),
):
    requireAdmin(getUserFromCookie(request))
    if not name.strip():
        raise HTTPException(status_code=422, detail="City name cannot be empty")
    try:
        cursor = db.cursor()
        cursor.execute("UPDATE Cities SET Name = ? WHERE Id = ?", (name.strip(), city_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="City not found")
        db.commit()
        return "Successfully renamed"
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
