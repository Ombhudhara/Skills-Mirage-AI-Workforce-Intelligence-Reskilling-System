import random
import time

def scrape_market_trends() -> list:
    """
    Mock scraping market trends.
    In a real scenario, this would use Playwright or BeautifulSoup to scrape job boards like LinkedIn or Naukri.
    """
    # Simulate network delay/scraping time
    time.sleep(1)
    
    cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad"]
    jobs = ["Software Engineer", "Data Entry Clerk", "Data Analyst", "Accountant", "Product Manager"]
    
    results = []
    
    for _ in range(10):
        # Generate some random mock trend data
        city = random.choice(cities)
        job = random.choice(jobs)
        demand = random.uniform(10, 100)
        
        # Determine automation signal based on job title
        automation_signal = 50.0 # moderate
        if "Entry" in job or "Accountant" in job:
            automation_signal = random.uniform(70, 95) # High
        elif "Software" in job or "Manager" in job:
            automation_signal = random.uniform(10, 30) # Low
            
        results.append({
            "city": city,
            "job_title": job,
            "demand_score": round(demand, 1),
            "ai_automation_signal": round(automation_signal, 1)
        })
        
    return results

def scrape_courses() -> list:
    """
    Mock scraping SWAYAM / NPTEL.
    """
    time.sleep(1)
    return [
        {"platform": "SWAYAM", "title": "Data Structures", "target_skill": "Algorithms", "duration_weeks": 8},
        {"platform": "NPTEL", "title": "Machine Learning Foundations", "target_skill": "Machine Learning", "duration_weeks": 12},
        {"platform": "PMKVY", "title": "Retail Sales Associate", "target_skill": "Sales", "duration_weeks": 4},
        {"platform": "SWAYAM", "title": "Full Stack Web Development", "target_skill": "Web Development", "duration_weeks": 10},
    ]

if __name__ == "__main__":
    print("Market Trends Sample:")
    print(scrape_market_trends()[:2])
    print("\nCourses Sample:")
    print(scrape_courses()[:2])
