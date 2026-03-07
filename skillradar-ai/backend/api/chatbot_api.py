"""
Chatbot API v2 – Unified AI Assistant powered by Groq & Skills Mirage Intelligence.
Integrated from Skills-Mirage-System for faster, smarter responses.
"""

from fastapi import APIRouter, Header, HTTPException, Depends
from auth.auth_utils import get_current_user
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import os
import sys
import pandas as pd
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Groq / LangChain Integration ---
try:
    from langchain_groq import ChatGroq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("langchain-groq not installed. AI features will be limited.")

# --- Models ---
import importlib
import chatbot
importlib.reload(chatbot)
from chatbot import create_chatbot_agent

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "English"
    job_title: Optional[str] = None
    city: Optional[str] = None
    experience: Optional[float] = None

# Initialize our new AI Strategist agent
try:
    _chatbot_agent = create_chatbot_agent()
except Exception as e:
    _chatbot_agent = None
    logger.error(f"Failed to initialize AI Strategist: {e}")

@router.post("/message")
def handle_chat_message(chat: ChatRequest):
    """
    New unified Chatbot endpoint.
    Uses the AI Strategist logic from Skills-Mirage-System.
    """
    global _chatbot_agent
    if not _chatbot_agent:
        try:
            _chatbot_agent = create_chatbot_agent()
        except Exception as e:
            logger.error(f"Lazy initialization failed: {e}")
            return {
                "reply": f"AI Engine Initialization Error: {e}. Please ensure GROQ_API_KEY is set.",
                "intent": "system_error",
                "sources": []
            }
    
    try:
        # Build enriched input for the AI Strategist
        enriched_input = chat.message
        if chat.job_title:
            enriched_input += f"\n[User Context: Job={chat.job_title}, City={chat.city or 'Unspecified'}, Exp={chat.experience or 0}yrs]"

        response = _chatbot_agent.invoke({
            "input": enriched_input,
            "language": chat.language or "English"
        })
        return {
            "reply": response["output"],
            "intent": "unified_query",
            "sources": ["Skills-Mirage-System Strategic-AI", "Groq (Llama-3-70B)"]
        }
    except Exception as e:
        logger.error(f"Chat error: {e}")
        
        # Reset the agent so it fully reloads with latest code/model settings on the next request 
        global _chatbot_agent
        _chatbot_agent = None
        
        # Instead of predefined offline mode answers, relay the actual error 
        # so the user knows what went wrong (e.g. rate limit, bad API key, etc.)
        return {
            "reply": f"[AI Engine Error]: Failed to generate response. {str(e)}",
            "intent": "system_error",
            "sources": ["chatbot.py"]
        }
