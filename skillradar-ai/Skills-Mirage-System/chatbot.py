import os
import pandas as pd
from typing import List, Dict

from dotenv import load_dotenv
load_dotenv()

# LangChain components
# LangChain / AI Components
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool

# Suppress warnings
import warnings
warnings.filterwarnings("ignore")

# Load datasets with absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JOBS_PATH = os.path.join(BASE_DIR, "data", "jobs.csv")
COURSES_PATH = os.path.join(BASE_DIR, "data", "courses_processed.csv")

try:
    jobs_df = pd.read_csv(JOBS_PATH)
    courses_df = pd.read_csv(COURSES_PATH)
except:
    jobs_df = pd.DataFrame()
    courses_df = pd.DataFrame()

# Global Vector Store for Course Knowledge
_VECTOR_DB = None

def get_vector_db():
    global _VECTOR_DB
    if _VECTOR_DB is not None:
        return _VECTOR_DB
    
    try:
        if not courses_df.empty:
            texts = [
                f"Course: {row['course_name']} | Provider: {row['provider']} | Skill: {row['skills_covered']} | Duration: {row['duration_weeks']} weeks"
                for _, row in courses_df.iterrows()
            ]
            # Use local embeddings for speed and privacy
            # Lazy load model only if needed
            from langchain_huggingface import HuggingFaceEmbeddings
            embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            _VECTOR_DB = FAISS.from_texts(texts, embeddings)
            return _VECTOR_DB
    except Exception as e:
        print(f"Vector DB init failed: {e}. Falling back to keyword search.")
        return None
    return None

def create_chatbot_agent():
    """
    Creates the Advanced AI Career Assistant.
    Provides data-driven insights on job market, risk, and reskilling.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    llm = ChatGroq(
        model_name="llama-3.1-8b-instant", # Switched to latest Llama 3.1 8B instant model
        groq_api_key=api_key,
        temperature=0.7 # Increase temperature slightly so responses are more dynamic and varied
    )

    class AIStrategist:
        def __init__(self, llm):
            self.llm = llm
            self.vector_db = None # Lazy load in invoke

        def invoke(self, inputs):
            query = inputs["input"]
            language = inputs.get("language", "English")
            
            # --- MARKET DATA RETRIEVAL (Fix 1, 2, 6) ---
            # Always grab basic metrics about our dataset
            context = ""
            temp_df = jobs_df
            for city in jobs_df["city"].unique():
                if str(city).lower() in query.lower():
                    temp_df = temp_df[temp_df["city"] == city]
                    break
            
            count = len(temp_df)
            avg_sal = round((temp_df["salary_min"] + temp_df["salary_max"]).mean() / 2, 1) if not temp_df.empty else 0
            context = f"Internal Data Insight: Job Market database currently tracks {count} job openings. Average Salary: ₹{avg_sal} LPA for this context."

            # --- COURSE KNOWLEDGE RETRIEVAL ---
            # Always look up vector db embeddings based on the exact user query
            course_context = ""
            if not self.vector_db:
                self.vector_db = get_vector_db()
            
            if self.vector_db:
                try:
                    docs = self.vector_db.similarity_search(query, k=3)
                    course_context = "Top Course/Upskilling Recommendations regarding user query:\n" + "\n".join([d.page_content for d in docs])
                except:
                    pass
            
            # Fallback to simple pandas search if vector search fails or is unavailable
            if not course_context and not courses_df.empty:
                matches = courses_df[courses_df['course_name'].str.contains(query.split()[-1], case=False, na=False)].head(3)
                if not matches.empty:
                    course_context = "Recommended Courses via regex:\n" + "\n".join([f"{r['course_name']} ({r['provider']})" for _, r in matches.iterrows()])

            system_prompt = f"""You are the SkillMirage AI Strategist. 
            You help workers navigate the transition from routine roles to AI-resistant careers.
            You must reply in {language}. 
            If Hindi is requested, use PURE HINDI (not hinglish) with proper devanagari-derived vocabulary.
            
            GUIDELINES:
            - Explain Risk Scores (0-30: Safe, 30-60: Medium, 60-100: High).
            - Recommend skills that improve RoleScore (HiringDemand + SkillTransferability + Safety).
            - Use the provided context data to answer precisely.
            
            DATA CONTEXT:
            {context}
            {course_context}
            
            User Message: {query}"""

            response = self.llm.invoke(system_prompt)
            return {"output": response.content}

    return AIStrategist(llm)

if __name__ == "__main__":
    print("\n===========================================================")
    print(" Skills Mirage Chatbot Initializing...")
    print(" Tools Loaded: Jobs Dataset, Courses Dataset, Live Web Search")
    print("===========================================================\n")
    
    try:
        # Prompt for language selection
        print("Select your preferred language / अपनी पसंदीदा भाषा चुनें:")
        print("1. English")
        print("2. Hindi / हिंदी")
        
        lang_choice = input("\nEnter choice (1 or 2): ").strip()
        selected_language = "Hindi" if lang_choice == "2" else "English"
        
        print(f"\nLanguage set to: {selected_language}")
        
        chatbot = create_chatbot_agent()
        print("Chatbot is ready! Enter your question (or type 'quit' to exit):")
        
        while True:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
                
            if not user_input.strip():
                continue
                
            try:
                response = chatbot.invoke({
                    "input": user_input,
                    "language": selected_language
                })
                print(f"\nSkills Mirage AI: {response['output']}")
            except Exception as e:
                print(f"\n[Error] Failed to get response: {str(e)}")
                print("Make sure you have set a valid GROQ_API_KEY environment variable.")
                
    except Exception as base_e:
        print(f"Failed to initialize chatbot: {base_e}")
