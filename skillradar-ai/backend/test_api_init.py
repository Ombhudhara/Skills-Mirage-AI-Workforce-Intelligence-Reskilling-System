import os
import sys
import logging

# Set up logging to see errors
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock the sys.path setup from main.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SKILLS_MIRAGE_DIR = os.path.join(os.path.dirname(BASE_DIR), "Skills-Mirage-System")
sys.path.insert(0, SKILLS_MIRAGE_DIR)

print(f"SKILLS_MIRAGE_DIR: {SKILLS_MIRAGE_DIR}")
print(f"sys.path[0]: {sys.path[0]}")

try:
    print("Importing create_chatbot_agent from chatbot...")
    from chatbot import create_chatbot_agent
    print("Success. Now trying to initialize agent...")
    agent = create_chatbot_agent()
    print("Agent initialized successfully!")
    
    # Test a simple invoke if initialized
    if agent:
        print("Testing agent invoke...")
        # Note: This requires GROQ_API_KEY
        # response = agent.invoke({"input": "Hello", "language": "English"})
        # print(f"Response: {response}")
        print("Agent looks healthy.")
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
