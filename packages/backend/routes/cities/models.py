from pydantic import BaseModel


class CityOut(BaseModel):
    id: int
    name: str
