from app.database import SessionLocal
from app.models.user import User, UserRole
import os
from app.auth.utils import get_password_hash

def create_test_user():
    password = os.environ.get("TEST_USER_PASSWORD")
    if not password:
        raise SystemExit("Set TEST_USER_PASSWORD before running create_test_user.py")
    db = SessionLocal()
    # Check if user already exists
    user = db.query(User).filter(User.email == "test@atomberg.com").first()
    if user:
        print("User already exists")
        return

    new_user = User(
        email="test@atomberg.com",
        password_hash=get_password_hash(password),
        name="Test User",
        role=UserRole.ADMIN,
        department="HR",
        designation="HR Manager"
    )
    db.add(new_user)
    db.commit()
    print("Test user created: test@atomberg.com")
    db.close()

if __name__ == "__main__":
    create_test_user()
