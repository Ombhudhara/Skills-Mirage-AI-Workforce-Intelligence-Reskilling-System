import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv(r"c:\Users\Meet\Downloads\hackmiend\hackmiend\skillradar-ai\backend\.env")
api_key = os.environ.get("GROQ_API_KEY")

try:
    llm = ChatGroq(model_name="llama3-8b-8192", groq_api_key=api_key)
    res = llm.invoke("Hello, respond with world")
    print(f"RESULT: {res.content}")
except Exception as e:
    print(f"ERROR: {e}")
