import os
import sys
from dotenv import load_dotenv

# Add the Skills-Mirage-System directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SKILLS_MIRAGE_DIR = os.path.join(BASE_DIR, "..", "Skills-Mirage-System")
sys.path.insert(0, SKILLS_MIRAGE_DIR)

load_dotenv(os.path.join(SKILLS_MIRAGE_DIR, ".env"))

try:
    print("Testing chatbot import and creation...")
    from chatbot import create_chatbot_agent
    agent = create_chatbot_agent()
    print("Chatbot agent created successfully.")
except Exception as e:
    print(f"Error captured: {e}")
    import traceback
    traceback.print_exc()
