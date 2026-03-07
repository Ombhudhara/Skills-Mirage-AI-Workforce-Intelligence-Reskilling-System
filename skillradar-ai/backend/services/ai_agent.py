import os
import logging
from typing import List, Optional
import pandas as pd
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import tool
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import SentenceTransformerEmbeddings

logger = logging.getLogger(__name__)

# Global variables to hold data context
_JOBS_DF: Optional[pd.DataFrame] = None
_COURSES_DF: Optional[pd.DataFrame] = None
_VECTOR_DB: Optional[FAISS] = None

def initialize_agent_data(jobs_df: pd.DataFrame, courses_df: pd.DataFrame):
    """Inject data context into the agent service."""
    global _JOBS_DF, _COURSES_DF, _VECTOR_DB
    _JOBS_DF = jobs_df
    _COURSES_DF = courses_df
    
    # Initialize FAISS for course search
    if courses_df is not None and not courses_df.empty:
        texts = [
            f"Course: {row['course_name']} | Provider: {row['provider']} | Skills: {row['skills_covered']} | Duration: {row['duration_weeks']} weeks"
            for _, row in courses_df.iterrows()
        ]
        embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
        _VECTOR_DB = FAISS.from_texts(texts, embeddings)
        logger.info("Chatbot FAISS Vector Store Initialized")

@tool
def query_job_market_data(query_description: str) -> str:
    """
    Use this tool to answer questions about job numbers, salaries, or city-specific trends.
    Example: 'How many BPO jobs in Indore?' or 'Average salary for Data Scientist in Bangalore'
    """
    global _JOBS_DF
    if _JOBS_DF is None or _JOBS_DF.empty:
        return "Job market data is currently unavailable."
    
    # Basic logic to handle numbers and trends
    q = query_description.lower()
    
    # Filter by city if mentioned
    df = _JOBS_DF
    found_city = "India"
    for city in _JOBS_DF["city"].unique():
        if str(city).lower() in q:
            df = df[df["city"] == city]
            found_city = city
            break
            
    # Filter by role if mentioned
    found_role = "All Roles"
    for role in _JOBS_DF["role"].unique():
        if str(role).lower() in q:
            df = df[df["role"] == role]
            found_role = role
            break
            
    count = len(df)
    avg_sal = round(df["salary_avg"].mean(), 2) if not df.empty else 0
    
    return f"Insights for {found_role} in {found_city}: Found {count} job openings. Average salary: ₹{avg_sal} LPA."

@tool
def search_courses(query: str) -> str:
    """Search for relevant courses from NPTEL, SWAYAM, and PMKVY."""
    global _VECTOR_DB
    if _VECTOR_DB is None:
        return "Course database is not initialized."
    
    docs = _VECTOR_DB.similarity_search(query, k=3)
    results = "\n".join([doc.page_content for doc in docs])
    return f"Top recommended courses:\n{results}"

def get_ai_response(message: str, history: List = None) -> str:
    """Generate response using Llama-3 via Groq with tool-calling."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "Error: GROQ_API_KEY not found in environment."

    llm = ChatGroq(
        temperature=0.1,
        model_name="llama3-70b-8192",
        groq_api_key=api_key
    )

    tools = [query_job_market_data, search_courses]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the SkillMirage AI Career Assistant. 
        You help users understand their AI automation risk, find safe jobs, and recommend reskilling paths.
        
        RULES:
        1. Use real data tools when asked about job numbers, salaries, or courses.
        2. Support English, Hindi (Devanagari), and Hinglish (Transliterated Hindi).
        3. If the user asks in Hindi, reply in Hindi.
        4. Be professional, data-driven, and encouraging.
        5. Explain Risk Scores (0-30: Safe, 30-60: Medium, 60-100: High).
        """),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    agent = create_openai_functions_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    try:
        response = agent_executor.invoke({
            "input": message,
            "chat_history": history or []
        })
        return response["output"]
    except Exception as e:
        logger.error(f"Agent execution error: {e}")
        return "I encountered an error processing your request. Please try again."
