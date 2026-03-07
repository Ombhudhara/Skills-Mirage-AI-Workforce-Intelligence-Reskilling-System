#!/usr/bin/env python
"""Test chatbot skill recommendation with context"""
import sys
import os

SKILLS_MIRAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "skills_mirage")
sys.path.insert(0, SKILLS_MIRAGE_DIR)

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))
sys.path.insert(0, os.getcwd())

from api.chatbot import ChatRequest, handle_chat_message

print("Testing skill recommendation with full context...")
request = ChatRequest(
    message="I am a Data Analyst. What skills should I learn?",
    user_role="Data Analyst",
    user_city="Bangalore",
    current_skills=["SQL", "Excel", "PowerBI"],
    career_goal="Data Analyst",
    use_rag=False
)

print(f"Request message: {request.message}")
print(f"User role: {request.user_role}")
print(f"Current skills: {request.current_skills}")

result = handle_chat_message(request)
print(f"\nIntent: {result.get('intent')}")
print(f"Confidence: {result.get('confidence')}")
print(f"Reply: {result.get('reply')}")
if result.get('data'):
    data = result.get('data')
    if isinstance(data, dict) and 'recommendations' in data:
        print(f"\nRecommendations ({len(data['recommendations'])} skills):")
        for rec in data['recommendations'][:3]:
            print(f"  - {rec['skill']}: Score {rec['score']}, Priority: {rec['priority']}")
