import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, cities, photos, tags, voivodeships

app = FastAPI(
    title="DigitalArchive API",
    description=(
        "API przygotowane podczas pracy nad projektektem na przedmiot Architektury i technologie systemów internetowych (2026L)."
        "Autor: Patryk Grochowicz"
    ),
    version="1.0.0",
)

origins = os.getenv("ALLOWED_ORIGINS")
origins_list = [o.strip() for o in origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voivodeships.router, prefix="/api")
app.include_router(tags.router, prefix="/api")
app.include_router(photos.public_router, prefix="/api")
app.include_router(auth.router, prefix="/api", include_in_schema=False)
app.include_router(cities.router, prefix="/api", include_in_schema=False)
app.include_router(photos.router, prefix="/api", include_in_schema=False)
