import spacy
from typing import List

# Load English NLP model. In production, ensure 'python -m spacy download en_core_web_sm' is run.
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Warning: spacy model 'en_core_web_sm' not found. Fallback to basic extraction.")
    nlp = None

def extract_skills_from_text(text: str) -> List[str]:
    """
    Extract technical and soft skills from user write-up.
    Using NLP and comprehensive skill dictionary.
    """
    if not text:
        return []

    # Comprehensive predefined tech and soft skills list
    KNOWN_SKILLS = {
        # Programming Languages
        "python", "java", "javascript", "c++", "c#", "ruby", "php", "go", "rust", "swift", "kotlin",
        "typescript", "scala", "r", "matlab", "perl", "groovy", "dart",
        
        # Web Frameworks & Libraries
        "react", "angular", "vue", "fastapi", "django", "flask", "spring", "express", "laravel",
        "asp.net", "next.js", "svelte", "ember", "backbone",
        
        # Databases
        "sql", "postgresql", "mysql", "mongodb", "redis", "cassandra", "dynamodb", "oracle",
        "elasticsearch", "firebase", "neo4j", "couchdb",
        
        # Cloud & DevOps
        "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform", "ansible",
        "gitlab ci", "github actions", "circleci", "openstack", "heroku",
        
        # Data & ML
        "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "keras",
        "data analysis", "data science", "nlp", "computer vision", "spark", "hadoop",
        "pandas", "numpy", "matplotlib", "seaborn", "plotly",
        
        # Other Technical
        "git", "rest api", "graphql", "microservices", "agile", "scrum", "linux", "unix",
        "windows server", "networking", "security", "blockchain", "ai", "artificial intelligence",
        "iot", "cloud computing", "devops", "ci/cd", "test automation", "selenium",
        
        # Soft Skills
        "leadership", "communication", "team collaboration", "problem solving", "project management",
        "time management", "critical thinking", "decision making", "adaptability", "creativity",
        "mentoring", "coaching", "public speaking", "negotiation", "stakeholder management"
    }

    text_lower = text.lower()
    extracted = set()

    # 1. Keyword matching
    for skill in KNOWN_SKILLS:
        if skill in text_lower:
            extracted.add(skill)

    # 2. NLP Noun Chunks (for multi-word technical terms)
    if nlp:
        try:
            doc = nlp(text)
            for chunk in doc.noun_chunks:
                chunk_text = chunk.text.lower().strip()
                # Check if multi-word chunk matches any skill
                for skill in KNOWN_SKILLS:
                    if len(chunk_text) > 2 and chunk_text in skill and len(extracted) < 15:
                        extracted.add(skill)
        except Exception as e:
            print(f"NLP processing error: {e}")
            pass

    if not extracted and text:
        # Fallback split for unknown but potentially important skills
        words = [w.strip().lower() for w in text.split() if len(w) > 3]
        for w in words:
            if w in KNOWN_SKILLS:
                extracted.add(w)

    return sorted(list(extracted))
