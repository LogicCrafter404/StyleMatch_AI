# backend/test_db.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import your connection Base and models
from app.database.connection import Base
from app.database.models import User, StylePreference

# Load credentials from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL is missing from your .env file!")
    exit(1)

# Mask password for secure logging
masked_url = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else DATABASE_URL
print(f"Connecting to: {masked_url}\n")

# Set up a session connection
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

try:
    # 1. Query the database to check if we already have users
    users = session.query(User).all()
    print(f"Current users in your Supabase database: {len(users)}")

    # 2. If the database is empty, let's insert our first user (Alex Mercer)
    if len(users) == 0:
        print("\nDatabase is empty. Inserting our first mock user...")
        
        # Create user entity
        mock_user = User(
            email="alex.mercer@stylematch.ai",
            password_hash="pbkdf2:sha256:mock_hash_value",  # Placeholder hash
            full_name="Alex Mercer"
        )
        session.add(mock_user)
        session.flush() # Generate mock_user.id in memory before committing
        
        # Create style preferences linked to this user's ID
        mock_preferences = StylePreference(
            user_id=mock_user.id,
            bio="Minimalist fashion enthusiast curating an effortless wardrobe.",
            styles=["Minimalist", "Streetwear"],
            occasions=["Office", "Daily Life"],
            preferred_colors=["Black", "White", "Navy"],
            avoided_colors=["Neon", "Yellow"]
        )
        session.add(mock_preferences)
        
        # Commit the transaction to Supabase
        session.commit()
        print("🎉 SUCCESS! Mock user 'Alex Mercer' and style preferences have been saved to Supabase.")
        
        # Re-query to verify the write operation
        users = session.query(User).all()
        print(f"Verified users in database: {len(users)}")

    # 3. Print out the users currently saved in the database
    print("\n--- DATABASE ENTRIES ---")
    for u in users:
        print(f"👤 Name: {u.full_name}")
        print(f"📧 Email: {u.email}")
        if u.style_preference:
            print(f"📝 Bio: {u.style_preference.bio}")
            print(f"🎨 Preferred Styles: {u.style_preference.styles}")
            print(f"🚫 Avoided Colors: {u.style_preference.avoided_colors}")
        print("-" * 30)

except Exception as e:
    session.rollback()
    print("Database transaction failed:", e)
finally:
    session.close()