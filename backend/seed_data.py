from app.core.database import SessionLocal
from app.models.restaurant import Restaurant
from app.models.menu_item import MenuItem
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem  # Add these
from app.core.security import get_password_hash

def seed_restaurants():
    db = SessionLocal()
    
    # Clear existing data in correct order (delete children before parents)
    db.query(OrderItem).delete()  # Delete order items first
    db.query(Order).delete()      # Then orders
    db.query(MenuItem).delete()   # Then menu items
    db.query(Restaurant).delete() # Finally restaurants
    
    # Create admin user if doesn't exist
    admin = db.query(User).filter(User.email == "admin@foodapp.com").first()
    if not admin:
        admin = User(
            email="admin@foodapp.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN
        )
        db.add(admin)
        db.commit()
        print("✅ Created admin user: admin@foodapp.com / admin123")
    else:
        print("ℹ️  Admin user already exists")
    
    db.commit()
    
    # Create restaurants
    restaurants_data = [
        {
            "name": "Pizza Paradise",
            "description": "Authentic Italian pizza made with fresh ingredients",
            "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
            "rating": 4.5,
            "address": "123 Main St, Downtown",
            "cuisine_type": "Italian"
        },
        {
            "name": "Sushi Master",
            "description": "Fresh sushi and Japanese cuisine",
            "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500",
            "rating": 4.8,
            "address": "456 Oak Ave, Midtown",
            "cuisine_type": "Japanese"
        },
        {
            "name": "Burger House",
            "description": "Juicy burgers and crispy fries",
            "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
            "rating": 4.3,
            "address": "789 Elm St, Uptown",
            "cuisine_type": "American"
        },
        {
            "name": "Curry Corner",
            "description": "Authentic Indian curries and tandoori specialties",
            "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
            "rating": 4.6,
            "address": "321 Spice Lane, Downtown",
            "cuisine_type": "Indian"
        }
    ]
    
    restaurants = []
    for data in restaurants_data:
        restaurant = Restaurant(**data)
        db.add(restaurant)
        db.commit()
        db.refresh(restaurant)
        restaurants.append(restaurant)
    
    # Create menu items for Pizza Paradise
    pizza_menu = [
        {"name": "Margherita Pizza", "description": "Classic tomato, mozzarella, and basil", "price": 12.99, "category": "Pizza", "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300", "is_vegetarian": 1},
        {"name": "Pepperoni Pizza", "description": "Loaded with pepperoni and cheese", "price": 14.99, "category": "Pizza", "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300", "is_vegetarian": 0},
        {"name": "Caesar Salad", "description": "Fresh romaine with Caesar dressing", "price": 8.99, "category": "Salad", "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300", "is_vegetarian": 1},
        {"name": "Garlic Bread", "description": "Toasted bread with garlic butter", "price": 5.99, "category": "Appetizer", "image": "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=300", "is_vegetarian": 1},
    ]
    
    for item in pizza_menu:
        menu_item = MenuItem(restaurant_id=restaurants[0].id, **item)
        db.add(menu_item)
    
    # Create menu items for Sushi Master
    sushi_menu = [
        {"name": "California Roll", "description": "Crab, avocado, cucumber", "price": 10.99, "category": "Roll", "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300", "is_vegetarian": 0},
        {"name": "Salmon Nigiri", "description": "Fresh salmon over rice", "price": 12.99, "category": "Nigiri", "image": "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=300", "is_vegetarian": 0},
        {"name": "Vegetable Tempura", "description": "Assorted vegetables lightly battered", "price": 8.99, "category": "Appetizer", "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300", "is_vegetarian": 1},
        {"name": "Miso Soup", "description": "Traditional Japanese soup", "price": 3.99, "category": "Soup", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", "is_vegetarian": 1},
    ]
    
    for item in sushi_menu:
        menu_item = MenuItem(restaurant_id=restaurants[1].id, **item)
        db.add(menu_item)
    
    # Create menu items for Burger House
    burger_menu = [
        {"name": "Classic Burger", "description": "Beef patty, lettuce, tomato, cheese", "price": 11.99, "category": "Burger", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", "is_vegetarian": 0},
        {"name": "Veggie Burger", "description": "Plant-based patty with all the fixings", "price": 10.99, "category": "Burger", "image": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300", "is_vegetarian": 1},
        {"name": "French Fries", "description": "Crispy golden fries", "price": 4.99, "category": "Side", "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300", "is_vegetarian": 1},
        {"name": "Onion Rings", "description": "Beer-battered onion rings", "price": 5.99, "category": "Side", "image": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=300", "is_vegetarian": 1},
    ]
    
    for item in burger_menu:
        menu_item = MenuItem(restaurant_id=restaurants[2].id, **item)
        db.add(menu_item)
    
    # Create menu items for Curry Corner
    curry_menu = [
        {"name": "Chicken Tikka Masala", "description": "Tender chicken in creamy tomato sauce", "price": 13.99, "category": "Main Course", "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300", "is_vegetarian": 0},
        {"name": "Vegetable Biryani", "description": "Fragrant rice with mixed vegetables", "price": 11.99, "category": "Main Course", "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300", "is_vegetarian": 1},
        {"name": "Samosas", "description": "Crispy pastries filled with spiced potatoes", "price": 6.99, "category": "Appetizer", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300", "is_vegetarian": 1},
        {"name": "Naan Bread", "description": "Fresh-baked Indian flatbread", "price": 3.99, "category": "Side", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300", "is_vegetarian": 1},
    ]
    
    for item in curry_menu:
        menu_item = MenuItem(restaurant_id=restaurants[3].id, **item)
        db.add(menu_item)
    
    db.commit()
    db.close()
    
    print("✅ Database seeded successfully!")
    print(f"✅ Created {len(restaurants)} restaurants")
    print(f"✅ Created menu items for each restaurant")

if __name__ == "__main__":
    seed_restaurants()