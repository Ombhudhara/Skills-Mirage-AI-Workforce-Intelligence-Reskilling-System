from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String, index=True)
    city = Column(String, index=True)
    experience_years = Column(Float)
    write_up = Column(Text)
    ai_risk_score = Column(Float, nullable=True) # 0-100
    created_at = Column(DateTime, default=datetime.utcnow)

    extracted_skills = relationship("UserSkill", back_populates="user")
    chat_history = relationship("ChatHistory", back_populates="user")

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"))
    skill_name = Column(String, index=True)
    vulnerability_index = Column(Float) # AI vulnerability for this specific skill

    user = relationship("UserProfile", back_populates="extracted_skills")

class JobMarketTrend(Base):
    __tablename__ = "job_market_trends"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True)
    job_title = Column(String, index=True)
    demand_score = Column(Float)
    ai_automation_signal = Column(Float) # How likely this job is to be automated
    recorded_at = Column(DateTime, default=datetime.utcnow)

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String) # SWAYAM, NPTEL, PMKVY
    title = Column(String, index=True)
    target_skill = Column(String, index=True)
    duration_weeks = Column(Integer)
    url = Column(String)

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=True)
    message_type = Column(String) # 'user' or 'ai'
    content = Column(Text)
    language = Column(String, default="en") # 'en' or 'hi'
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="chat_history")
