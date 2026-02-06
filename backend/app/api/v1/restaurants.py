from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.restaurant import Restaurant
from app.models.menu_item import MenuItem
from app.schemas.restaurant import (
    RestaurantResponse,
    RestaurantWithMenu,
    RestaurantCreate,
    MenuItemResponse,
    MenuItemCreate
)

router = APIRouter()

# Get all restaurants
@router.get("/", response_model=List[RestaurantResponse])
def get_restaurants(db: Session = Depends(get_db)):
    restaurants = db.query(Restaurant).all()
    return restaurants

# Get single restaurant by ID
@router.get("/{restaurant_id}", response_model=RestaurantWithMenu)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

# Create restaurant (for testing/admin)
@router.post("/", response_model=RestaurantResponse)
def create_restaurant(restaurant: RestaurantCreate, db: Session = Depends(get_db)):
    db_restaurant = Restaurant(**restaurant.dict())
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

# Get menu for a restaurant
@router.get("/{restaurant_id}/menu", response_model=List[MenuItemResponse])
def get_restaurant_menu(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    menu_items = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()
    return menu_items

# Create menu item (for testing/admin)
@router.post("/menu", response_model=MenuItemResponse)
def create_menu_item(menu_item: MenuItemCreate, db: Session = Depends(get_db)):
    db_menu_item = MenuItem(**menu_item.dict())
    db.add(db_menu_item)
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item