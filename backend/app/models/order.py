from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, confirmed, preparing, ready, delivered, cancelled
    delivery_address = Column(Text)
    special_instructions = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    restaurant = relationship("Restaurant")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # Store price at time of order
    item_name = Column(String)  # Store name at time of order (in case menu changes)
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    menu_item = relationship("MenuItem")