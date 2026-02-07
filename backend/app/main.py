from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api.v1 import auth, restaurants, orders, admin

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Food Ordering API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(restaurants.router, prefix="/api/v1/restaurants", tags=["restaurants"]) 
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"]) 


@app.get("/")
def read_root():
    return {"message": "Food Ordering API is running!"}