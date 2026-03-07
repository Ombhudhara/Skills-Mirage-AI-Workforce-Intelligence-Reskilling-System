#!/usr/bin/env python
"""
Quick test script for enhanced chatbot functionality
"""
import sys
import os

# Add skills_mirage to path
SKILLS_MIRAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "skills_mirage")
sys.path.insert(0, SKILLS_MIRAGE_DIR)

# Change to backend directory for API tests
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))
sys.path.insert(0, os.getcwd())

# Load data
from pipeline.data_pipeline import build_pipeline
jobs_df, courses_df = build_pipeline(force=False, enable_scraping=False)

print(f"Jobs loaded: {len(jobs_df)} records")
print(f"Courses loaded: {len(courses_df)} records")

# Test chatbot
from api.chatbot import handle_chat_message, ChatRequest

print("\n" + "="*60)
print("TEST 1: Risk Assessment Query")
print("="*60)
request = ChatRequest(
    message="My risk score is 75. What should I do?",
    user_role="Data Entry Operator",
    user_city="Bangalore",
    risk_score=75,
    current_skills=["Excel", "Data Entry"],
    use_rag=False
)
result = handle_chat_message(request)
print(f"Intent: {result.get('intent')}")
print(f"Confidence: {result.get('confidence')}")
print(f"Reply: {result.get('reply')}")

print("\n" + "="*60)
print("TEST 2: Skill Recommendation Query")
print("="*60)
request = ChatRequest(
    message="I'm a Data Analyst. What skills should I learn?",
    user_role="Data Analyst",
    user_city="Bangalore",
    current_skills=["SQL", "Excel", "PowerBI"],
    career_goal="Data Analyst",
    use_rag=False
)
result = handle_chat_message(request)
print(f"Intent: {result.get('intent')}")
print(f"Confidence: {result.get('confidence')}")
print(f"Reply: {result.get('reply')}")
if result.get('data'):
    print(f"Data: {result.get('data')}")

print("\n" + "="*60)
print("TEST 3: Course Recommendation Query")
print("="*60)
request = ChatRequest(
    message="What courses should I take?",
    user_role="Data Analyst",
    user_city="Mumbai",
    current_skills=["SQL", "Excel"],
    use_rag=False
)
result = handle_chat_message(request)
print(f"Intent: {result.get('intent')}")
print(f"Reply: {result.get('reply')}")

print("\n" + "="*60)
print("TEST 4: City Intelligence Query")
print("="*60)
request = ChatRequest(
    message="What are the top skills in Bangalore?",
    user_city="Bangalore",
    use_rag=False
)
result = handle_chat_message(request)
print(f"Intent: {result.get('intent')}")
print(f"Reply: {result.get('reply')}")

print("\n" + "="*60)
print("TEST 5: Hindi/Hinglish Query")
print("="*60)
request = ChatRequest(
    message="Mera risk score kya hai aur kya seekhna chahiye?",
    user_role="Data Entry",
    risk_score=60,
    current_skills=["Excel"],
    use_rag=False
)
result = handle_chat_message(request)
print(f"Intent: {result.get('intent')}")
print(f"Reply: {result.get('reply')}")

print("\n" + "="*60)
print("All tests completed!")
print("="*60)
