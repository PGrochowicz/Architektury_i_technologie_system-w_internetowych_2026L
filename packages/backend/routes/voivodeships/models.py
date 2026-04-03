from pydantic import BaseModel, Field
from typing import List


class VoivodeshipOut(BaseModel):
    id: int
    name: str


class CityOut(BaseModel):
    id: int
    name: str


class VoivodeshipDetailsResponse(BaseModel):
    voivodeship: VoivodeshipOut
    cities: List[CityOut] = Field(default_factory=list)
