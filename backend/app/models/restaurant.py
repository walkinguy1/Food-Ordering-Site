from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    image = Column(String)  # URL to image
    rating = Column(Float, default=0.0)
    address = Column(String)
    cuisine_type = Column(String)  # Italian, Chinese, Indian, etc.
    
    # Relationship to menu items
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")