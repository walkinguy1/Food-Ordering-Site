from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String)  # Appetizer, Main Course, Dessert, etc.
    image = Column(String)  # URL to image
    is_vegetarian = Column(Integer, default=0)  # 0 = No, 1 = Yes
    is_available = Column(Integer, default=1)  # 0 = Not available, 1 = Available
    
    # Relationship to restaurant
    restaurant = relationship("Restaurant", back_populates="menu_items")