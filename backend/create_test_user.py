from app.database import SessionLocal
from app.models.user import User, UserRole
from app.auth.utils import get_password_hash

def create_test_user():
    db = SessionLocal()
    # Check if user already exists
    user = db.query(User).filter(User.email == "test@atomberg.com").first()
    if user:
        print("User already exists")
        return

    new_user = User(
        email="test@atomberg.com",
        password_hash=get_password_hash("testpassword"),
        name="Test User",
        role=UserRole.ADMIN,
        department="HR",
        designation="HR Manager"
    )
    db.add(new_user)
    db.commit()
    print("Test user created: test@atomberg.com / testpassword")
    db.close()

if __name__ == "__main__":
    create_test_user()
