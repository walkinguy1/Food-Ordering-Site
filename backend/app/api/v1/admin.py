from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.admin import require_admin, get_current_user
from app.models.restaurant import Restaurant
from app.models.menu_item import MenuItem
from app.models.order import Order
from app.models.user import User
from app.schemas.restaurant import (
    RestaurantCreate,
    RestaurantResponse,
    MenuItemCreate,
    MenuItemResponse
)
from pydantic import BaseModel

router = APIRouter()

# Dashboard Statistics
class DashboardStats(BaseModel):
    total_restaurants: int
    total_menu_items: int
    total_orders: int
    total_users: int
    pending_orders: int
    total_revenue: float

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    total_restaurants = db.query(Restaurant).count()
    total_menu_items = db.query(MenuItem).count()
    total_orders = db.query(Order).count()
    total_users = db.query(User).count()
    pending_orders = db.query(Order).filter(Order.status == "pending").count()
    
    # Calculate total revenue
    orders = db.query(Order).all()
    total_revenue = sum(order.total_amount for order in orders)
    
    return DashboardStats(
        total_restaurants=total_restaurants,
        total_menu_items=total_menu_items,
        total_orders=total_orders,
        total_users=total_users,
        pending_orders=pending_orders,
        total_revenue=total_revenue
    )

# Restaurant Management
@router.post("/restaurants", response_model=RestaurantResponse)
def create_restaurant_admin(
    restaurant: RestaurantCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    db_restaurant = Restaurant(**restaurant.dict())
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@router.put("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    restaurant_update: RestaurantCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    for key, value in restaurant_update.dict().items():
        setattr(db_restaurant, key, value)
    
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@router.delete("/restaurants/{restaurant_id}")
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    db.delete(db_restaurant)
    db.commit()
    return {"message": "Restaurant deleted successfully"}

# Menu Item Management
@router.post("/menu-items", response_model=MenuItemResponse)
def create_menu_item_admin(
    menu_item: MenuItemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    db_menu_item = MenuItem(**menu_item.dict())
    db.add(db_menu_item)
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item

@router.put("/menu-items/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    item_id: int,
    menu_item_update: MenuItemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    db_menu_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    for key, value in menu_item_update.dict().items():
        setattr(db_menu_item, key, value)
    
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item

@router.delete("/menu-items/{item_id}")
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    db_menu_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db.delete(db_menu_item)
    db.commit()
    return {"message": "Menu item deleted successfully"}

# Order Management
class OrderStatusUpdate(BaseModel):
    status: str

@router.get("/orders", response_model=List[dict])
def get_all_orders(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    
    # Include user and restaurant info
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "user_email": order.user.email,
            "user_name": order.user.full_name,
            "restaurant_id": order.restaurant_id,
            "restaurant_name": order.restaurant.name,
            "total_amount": order.total_amount,
            "status": order.status,
            "delivery_address": order.delivery_address,
            "created_at": order.created_at,
            "items_count": len(order.order_items)
        })
    
    return result

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Validate status
    valid_statuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    db_order.status = status_update.status
    db.commit()
    
    return {"message": "Order status updated successfully", "new_status": status_update.status}

# User Management
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    users = db.query(User).all()
    return [{
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": user.created_at
    } for user in users]