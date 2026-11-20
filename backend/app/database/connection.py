import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is missing from your .env file!")

# Create the engine with pg_ping to keep serverless connections alive
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# SessionLocal is what our server routes will call to read/write data
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for defining our database schema mapping
Base = declarative_base()

# Helper function to open and close database connections safely
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()