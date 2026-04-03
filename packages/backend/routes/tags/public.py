import pyodbc

from fastapi import APIRouter, Depends, HTTPException

from routes.helpers.db import get_db
from routes.helpers.models import swaggerErrorResponses
from routes.tags.models import TagOut

router = APIRouter(
    prefix="/tags",
    tags=["Public API"],
)

@router.get("",
    response_model=list[TagOut],
    summary="Lista tagów",
    description="Zwraca wszystkie dostępne tagi posortowane po nazwie.",
    responses=swaggerErrorResponses)
def getAll(db: pyodbc.Connection = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT Id, Name FROM Tags ORDER BY Name")
        return [{"id": r[0], "name": r[1]} for r in cursor.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
