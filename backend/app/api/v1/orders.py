from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderResponse, OrderWithItems
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.user import User

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# Create order
@router.post("/", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    # Calculate total
    total_amount = sum(item.price * item.quantity for item in order_data.items)
    
    # Create order
    db_order = Order(
        user_id=current_user.id,
        restaurant_id=order_data.restaurant_id,
        total_amount=total_amount,
        delivery_address=order_data.delivery_address,
        special_instructions=order_data.special_instructions,
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items
    for item in order_data.items:
        db_order_item = OrderItem(
            order_id=db_order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            price=item.price,
            item_name=item.item_name
        )
        db.add(db_order_item)
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

# Get user's orders
@router.get("/my-orders", response_model=List[OrderWithItems])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

# Get single order
@router.get("/{order_id}", response_model=OrderWithItems)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order