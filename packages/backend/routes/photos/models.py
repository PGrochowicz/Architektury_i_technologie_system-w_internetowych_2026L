from pydantic import BaseModel, Field
from typing import List


class CreatePhotoBody(BaseModel):
    file: str
    fileName: str
    cityId: int = 0
    description: str
    takenYear: int | None = None
    takenMonth: int | None = None
    takenDay: int | None = None
    tags: list[str] = []
    customCityName: str | None = None
    voivodeshipId: int | None = None


class UpdatePhotoBody(BaseModel):
    cityId: int = 0
    description: str
    takenYear: int | None = None
    takenMonth: int | None = None
    takenDay: int | None = None
    tags: list[str] | None = None
    file: str | None = None
    fileName: str | None = None
    customCityName: str | None = None
    voivodeshipId: int | None = None


class PhotoItemOut(BaseModel):
    id: int
    cityId: int
    description: str
    storedFileName: str
    takenYear: int | None = None
    takenMonth: int | None = None
    takenDay: int | None = None
    voivodeshipName: str
    cityName: str
    tags: List[str] = Field(default_factory=list)


class AdminPhotoItemOut(PhotoItemOut):
    createdByUserId: int
    createdByDisplayName: str
    createdByIsActive: bool


class PhotoPageOut(BaseModel):
    items: List[PhotoItemOut]
    total: int


class AdminPhotoPageOut(BaseModel):
    items: List[AdminPhotoItemOut]
    total: int
