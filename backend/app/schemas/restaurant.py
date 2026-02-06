from pydantic import BaseModel
from typing import Optional, List

# Menu Item Schemas
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image: Optional[str] = None
    is_vegetarian: Optional[int] = 0
    is_available: Optional[int] = 1

class MenuItemCreate(MenuItemBase):
    restaurant_id: int

class MenuItemResponse(MenuItemBase):
    id: int
    restaurant_id: int
    
    class Config:
        from_attributes = True

# Restaurant Schemas
class RestaurantBase(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    rating: Optional[float] = 0.0
    address: Optional[str] = None
    cuisine_type: Optional[str] = None

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantResponse(RestaurantBase):
    id: int
    
    class Config:
        from_attributes = True

class RestaurantWithMenu(RestaurantResponse):
    menu_items: List[MenuItemResponse] = []
    
    class Config:
        from_attributes = True