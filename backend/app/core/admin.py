from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get currently authenticated user from token"""
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

def require_admin(current_user: User = Depends(get_current_user)):
    """Require user to be an admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Not authorized. Admin access required."
        )
    return current_user

def require_restaurant_owner(current_user: User = Depends(get_current_user)):
    """Require user to be a restaurant owner or admin"""
    if current_user.role not in [UserRole.RESTAURANT_OWNER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Not authorized. Restaurant owner or admin access required."
        )
    return current_user