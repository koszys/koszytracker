from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.auth.router import router as auth_router
from app.wishes.router import router as wishes_router
# Import models here so they are registered with Base for create_all
from app.auth import models as auth_models
from app.accounts import models as account_models
from app.wishes import models as wish_models

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(wishes_router)

@app.get("/")
def root():
    return {"message": "Wish Tracker API"}
