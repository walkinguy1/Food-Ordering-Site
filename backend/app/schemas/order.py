from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Order Item Schemas
class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int
    price: float
    item_name: str

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    price: float
    item_name: str
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    restaurant_id: int
    items: List[OrderItemCreate]
    delivery_address: str
    special_instructions: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    total_amount: float
    status: str
    delivery_address: str
    special_instructions: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderWithItems(OrderResponse):
    order_items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True