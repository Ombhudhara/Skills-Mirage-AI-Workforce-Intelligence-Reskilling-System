def generate_learning_paths(target_role: str, current_skills: list[str]) -> list:
    """
    Generate a week-by-week learning path using mock data from NPTEL/SWAYAM.
    """
    
    # Mock database of courses
    courses_db = {
        "Data Analysis": [
            {"week": 1, "topic": "Introduction to Python", "platform": "SWAYAM", "course": "Python for Everybody", "hours": 4},
            {"week": 2, "topic": "Data Wrangling with Pandas", "platform": "NPTEL", "course": "Data Analytics with Python", "hours": 5},
            {"week": 3, "topic": "Data Visualization", "platform": "Coursera", "course": "Data Viz with Matplotlib", "hours": 4},
            {"week": 4, "topic": "Final Project", "platform": "Self-driven", "course": "Kaggle Dataset Analysis", "hours": 8},
        ],
        "Software Engineering": [
            {"week": 1, "topic": "Web Fundamentals (HTML/CSS/JS)", "platform": "NPTEL", "course": "Web Technologies", "hours": 6},
            {"week": 2, "topic": "React Basics", "platform": "SWAYAM", "course": "Modern Frontend Dev", "hours": 6},
            {"week": 3, "topic": "Backend with FastAPI", "platform": "Open-Source", "course": "FastAPI Masterclass", "hours": 5},
            {"week": 4, "topic": "Database Integration", "platform": "NPTEL", "course": "Database Management Systems", "hours": 5},
        ]
    }

    # Select path based on simple keyword matching or default
    path_key = "Data Analysis" if "data" in target_role.lower() else "Software Engineering"
    
    weekly_plan = courses_db.get(path_key, courses_db["Software Engineering"])

    return {
        "target_role": target_role,
        "estimated_duration_weeks": len(weekly_plan),
        "weekly_plan": weekly_plan,
        "alternative_safe_jobs": ["Data Engineer", "Cloud Architect", "Product Manager"]
    }
