from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class WorkerProfileBase(BaseModel):
    job_title: str
    city: str
    experience: float
    work_description: str

class WorkerProfileCreate(WorkerProfileBase):
    pass

class WorkerProfileResponse(WorkerProfileBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class WorkerProfileInDB(WorkerProfileBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
