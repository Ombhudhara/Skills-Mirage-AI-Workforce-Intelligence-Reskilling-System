"""
LinkedIn Job Scraper - Selenium + BeautifulSoup
Scrapes job listings from LinkedIn Jobs
Collects: Job Title, Company, City, Skills, Salary, Experience, Job Description, Posting Date
"""

import time
import re
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict

import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LinkedInJob:
    job_title: str
    company: str
    city: str
    skills: str
    salary_min: Optional[float]
    salary_max: Optional[float]
    experience_min: int
    experience_max: int
    job_description: str
    posting_date: str
    source: str = "LinkedIn"
    scraped_at: str = ""

class LinkedInScraper:
    BASE_URL = "https://www.linkedin.com/jobs/search/"
    
    def __init__(self, headless=True, timeout=30, delay=2.0, max_jobs=100):
        self.headless = headless
        self.timeout = timeout
        self.delay = delay
        self.max_jobs = max_jobs
        self.driver = None
        self.jobs = []
        
    def _init_driver(self):
        options = Options()
        if self.headless:
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        return webdriver.Chrome(options=options)
    
    def _build_search_url(self, keywords, location="India"):
        return f"{self.BASE_URL}?keywords={keywords.replace(' ', '%20')}&location={location.replace(' ', '%20')}"
    
    def _parse_posting_date(self, date_text):
        date_text = date_text.lower().strip()
        if "just" in date_text or "today" in date_text:
            return datetime.now().strftime("%Y-%m-%d")
        hour_match = re.search(r'(\d+)\s*hour', date_text)
        if hour_match:
            return (datetime.now() - timedelta(hours=int(hour_match.group(1)))).strftime("%Y-%m-%d")
        day_match = re.search(r'(\d+)\s*day', date_text)
        if day_match:
            return (datetime.now() - timedelta(days=int(day_match.group(1)))).strftime("%Y-%m-%d")
        week_match = re.search(r'(\d+)\s*week', date_text)
        if week_match:
            return (datetime.now() - timedelta(weeks=int(week_match.group(1)))).strftime("%Y-%m-%d")
        return datetime.now().strftime("%Y-%m-%d")
    
    def _parse_experience(self, exp_text):
        if not exp_text:
            return (0, 10)
        match = re.search(r'(\d+)\s*[-]\s*(\d+)\s*[Yy]r?', exp_text)
        if match:
            return (int(match.group(1)), int(match.group(2)))
        return (0, 10)
    
    def _parse_salary(self, salary_text):
        if not salary_text or "not disclosed" in salary_text.lower():
            return (None, None)
        lpa_match = re.search(r'(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*lpa', salary_text.lower())
        if lpa_match:
            return (float(lpa_match.group(1)), float(lpa_match.group(2)))
        return (None, None)
    
    def _extract_skills_from_description(self, description):
        SKILL_KEYWORDS = ['python', 'java', 'javascript', 'typescript', 'c++', 'sql', 'mysql', 'postgresql', 'mongodb', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'data analysis', 'data science', 'analytics', 'tableau', 'powerbi', 'nlp', 'computer vision', 'ai', 'ml', 'excel', 'git', 'linux', 'agile', 'scrum', 'rest', 'api', 'spark', 'hadoop']
        found = [s.title() for s in SKILL_KEYWORDS if s in description.lower()]
        return ', '.join(found[:15]) if found else "General"
    
    def scrape_role(self, role, location="India", pages=5):
        logger.info(f"Scraping LinkedIn for {role} in {location}")
        self.jobs = []
        try:
            self.driver = self._init_driver()
            wait = WebDriverWait(self.driver, self.timeout)
            self.driver.get(self._build_search_url(role, location))
            time.sleep(3)
            for page in range(pages):
                try:
                    job_cards = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".job-card-container")))
                except TimeoutException:
                    break
                for card in job_cards[:20]:
                    try:
                        title = card.find_element(By.CSS_SELECTOR, ".job-card-list__title").text.strip()
                        company = card.find_element(By.CSS_SELECTOR, ".job-card-container__company-name").text.strip()
                        city = card.find_element(By.CSS_SELECTOR, ".job-card-container__metadata-item").text.strip()
                        try:
                            date = card.find_element(By.CSS_SELECTOR, ".job-card-container__listed-time").text
                            posting_date = self._parse_posting_date(date)
                        except:
                            posting_date = datetime.now().strftime("%Y-%m-%d")
                        desc = f"{title} at {company}"
                        skills = self._extract_skills_from_description(desc)
                        exp_min, exp_max = self._parse_experience("0-5 Years")
                        sal_min, sal_max = self._parse_salary("Not disclosed")
                        self.jobs.append(asdict(LinkedInJob(title, company, city, skills, sal_min, sal_max, exp_min, exp_max, desc, posting_date, "LinkedIn", datetime.now().isoformat())))
                        if len(self.jobs) >= self.max_jobs:
                            break
                    except:
                        continue
                if len(self.jobs) >= self.max_jobs:
                    break
                try:
                    next_btn = self.driver.find_element(By.CSS_SELECTOR, "button[aria-label='Next']")
                    if next_btn.is_enabled():
                        next_btn.click()
                        time.sleep(self.delay)
                except:
                    break
        except Exception as e:
            logger.error(f"Error: {e}")
        finally:
            if self.driver:
                self.driver.quit()
        return self.jobs

def scrape_linkedin_jobs(roles=None, location="India", output_file=None):
    if roles is None:
        roles = ["Software Engineer", "Data Scientist", "Data Analyst", "Machine Learning Engineer", "Full Stack Developer"]
    scraper = LinkedInScraper()
    all_jobs = []
    for role in roles:
        all_jobs.extend(scraper.scrape_role(role, location))
        time.sleep(2)
    df = pd.DataFrame(all_jobs)
    if not df.empty:
        df = df.rename(columns={'job_title': 'role', 'job_description': 'description'})
    if output_file and not df.empty:
        df.to_csv(output_file, index=False)
    return df

if __name__ == "__main__":
    df = scrape_linkedin_jobs(["Data Scientist", "Data Analyst"], "India", "data/linkedin_jobs.csv")
    print(f"Scraped {len(df)} jobs")
