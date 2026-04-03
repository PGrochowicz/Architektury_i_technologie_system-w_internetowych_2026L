import pyodbc

from fastapi import APIRouter, Depends, HTTPException, Query

from routes.helpers.db import get_db
from routes.helpers.models import swaggerErrorResponses
from routes.voivodeships.models import VoivodeshipDetailsResponse, VoivodeshipOut

router = APIRouter(
    prefix="/voivodeships",
    tags=["Public API"],
)


@router.get("",
    response_model=list[VoivodeshipOut],
    summary="Lista województw",
    description="Zwraca identyfikatory i nazwy wszystkich województw posortowane alfabetycznie.",
    responses=swaggerErrorResponses)
def getAll(db: pyodbc.Connection = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT Id, Name FROM Voivodeships ORDER BY Name")
        return [{"id": r[0], "name": r[1]} for r in cursor.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/details",
    response_model=VoivodeshipDetailsResponse,
    summary="Województwo i przypisane miasta",
    description="Na podstawie identyfikatora województwa zwraca jego nazwę oraz listę miast.",
    responses=swaggerErrorResponses)
def getDetails(
    Id: int = Query(...),
    db: pyodbc.Connection = Depends(get_db),
):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT Id, Name FROM Voivodeships WHERE Id = ?", (Id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Voivodeship not found")
        cursor.execute(
            "SELECT Id, Name FROM Cities WHERE VoivodeshipId = ? ORDER BY Name",
            (row[0],),
        )
        return {
            "voivodeship": {"id": row[0], "name": row[1]},
            "cities": [{"id": r[0], "name": r[1]} for r in cursor.fetchall()],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
