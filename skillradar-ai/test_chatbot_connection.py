import os
import sys
from dotenv import load_dotenv

# Add the project root to sys.path to find Skills-Mirage-System
project_root = r"c:\Users\Meet\Downloads\hackmiend\hackmiend\skillradar-ai"
skills_mirage_dir = os.path.join(project_root, "Skills-Mirage-System")
sys.path.insert(0, skills_mirage_dir)

load_dotenv(os.path.join(project_root, "backend", ".env"))

print(f"GROQ_API_KEY: {os.environ.get('GROQ_API_KEY')}")

try:
    from chatbot import create_chatbot_agent
    chatbot = create_chatbot_agent()
    print("Agent initialized.")
    response = chatbot.invoke({"input": "What are safe jobs?", "language": "English"})
    print(f"Response: {response['output']}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
