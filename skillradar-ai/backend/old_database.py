from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Example: postgresql://user:password@localhost/skillradar
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/skillradar")

# Setting pool_pre_ping to check connections before using them
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
