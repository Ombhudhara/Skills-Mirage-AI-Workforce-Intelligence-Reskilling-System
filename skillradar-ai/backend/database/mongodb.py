import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "skills_mirage"

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]

def get_db():
    return db

def get_users_collection():
    return db["users"]

def get_profiles_collection():
    return db["worker_profiles"]
