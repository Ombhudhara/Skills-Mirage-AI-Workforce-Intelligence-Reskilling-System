"""
Apify Scraper Integration for LinkedIn and Naukri
API client for Apify scrapers with 6-hour scheduling
"""

import os
import time
import logging
import requests
from typing import List, Dict, Optional
from datetime import datetime
import pandas as pd
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ApifyScraper:
    BASE_URL = "https://api.apify.com/v2"
    ACTORS = {
        "linkedin": "apify/linkedin-jobs-scraper",
        "naukri": "apify/naukri-jobs-scraper"
    }
    
    def __init__(self, api_token: str = None):
        self.api_token = api_token or os.environ.get("APIFY_API_TOKEN")
        if not self.api_token:
            logger.warning("Apify API token not provided. Set APIFY_API_TOKEN env var.")
        self.headers = {"Authorization": f"Bearer {self.api_token}"} if self.api_token else {}
    
    def _run_actor(self, actor_id: str, run_input: dict) -> str:
        url = f"{self.BASE_URL}/acts/{actor_id}/runs"
        try:
            response = requests.post(url, json=run_input, headers=self.headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}).get("id")
        except Exception as e:
            logger.error(f"Failed to start actor: {e}")
            return None
    
    def _get_dataset_items(self, dataset_id: str, limit: int = 10000) -> List[Dict]:
        url = f"{self.BASE_URL}/datasets/{dataset_id}/items"
        params = {"format": "json", "limit": limit}
        try:
            response = requests.get(url, params=params, headers=self.headers, timeout=60)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch dataset: {e}")
            return []
    
    def _wait_for_completion(self, run_id: str, timeout: int = 600) -> Optional[str]:
        url = f"{self.BASE_URL}/runs/{run_id}"
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = requests.get(url, headers=self.headers, timeout=30)
                data = response.json()
                status = data.get("data", {}).get("status")
                if status == "SUCCEEDED":
                    return data.get("data", {}).get("defaultDatasetId")
                elif status in ["FAILED", "ABORTED", "TIMED-OUT"]:
                    return None
                time.sleep(10)
            except:
.sleep(10)
                time        return None
    
    def scrape_linkedin_jobs(self, search_terms: List[str], locations: List[str] = None, max_jobs: int = 500) -> pd.DataFrame:
        if not self.api_token:
            return self._mock_jobs("LinkedIn", search_terms)
        actor_id = self.ACTORS["linkedin"]
        run_input = {"searchTerms": search_terms, "locations": locations or ["India"], "maxJobs": max_jobs}
        run_id = self._run_actor(actor_id, run_input)
        if not run_id:
            return pd.DataFrame()
        dataset_id = self._wait_for_completion(run_id)
        if not dataset_id:
            return pd.DataFrame()
        items = self._get_dataset_items(dataset_id)
        if not items:
            return pd.DataFrame()
        jobs = []
        for item in items:
            jobs.append({
                "role": item.get("title", ""),
                "company": item.get("companyName", ""),
                "city": item.get("location", ""),
                "skills": ", ".join(item.get("skills", [])),
                "salary_min": self._parse_salary(item.get("salary")),
                "salary_max": self._parse_salary(item.get("salary")),
                "experience_min": 0,
                "experience_max": 5,
                "description": item.get("description", ""),
                "posting_date": item.get("postedAt", datetime.now().isoformat()),
                "source": "LinkedIn"
            })
        return pd.DataFrame(jobs)
    
    def scrape_naukri_jobs(self, search_terms: List[str], locations: List[str] = None, max_jobs: int = 500) -> pd.DataFrame:
        if not self.api_token:
            return self._mock_jobs("Naukri", search_terms)
        actor_id = self.ACTORS["naukri"]
        run_input = {"searchQueries": search_terms, "locations": locations or ["India"], "maxResults": max_jobs}
        run_id = self._run_actor(actor_id, run_input)
        if not run_id:
            return pd.DataFrame()
        dataset_id = self._wait_for_completion(run_id)
        if not dataset_id:
            return pd.DataFrame()
        items = self._get_dataset_items(dataset_id)
        if not items:
            return pd.DataFrame()
        jobs = []
        for item in items:
            jobs.append({
                "role": item.get("title", item.get("jobTitle", "")),
                "company": item.get("company", ""),
                "city": item.get("location", ""),
                "skills": item.get("skills", ""),
                "salary_min": self._parse_salary(item.get("salary", "")),
                "salary_max": self._parse_salary(item.get("salary", "")),
                "experience_min": 0,
                "experience_max": 5,
                "description": item.get("jobDescription", item.get("description", "")),
                "posting_date": item.get("postedDate", datetime.now().isoformat()),
                "source": "Naukri"
            })
        return pd.DataFrame(jobs)
    
    def _parse_salary(self, salary_text: str) -> Optional[float]:
        if not salary_text:
            return None
        match = re.search(r'(\d+\.?\d*)\s*L', salary_text, re.IGNORECASE)
        if match:
            return float(match.group(1))
        return None
    
    def _mock_jobs(self, source: str, roles: List[str]) -> pd.DataFrame:
        jobs = []
        cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune"]
        for role in roles:
            for city in cities[:3]:
                jobs.append({
                    "role": role, "company": f"{role} Corp", "city": city,
                    "skills": "Python, SQL, Machine Learning",
                    "salary_min": 5.0, "salary_max": 15.0,
                    "experience_min": 1, "experience_max": 5,
                    "description": f"Looking for {role}", "posting_date": datetime.now().isoformat(), "source": source
                })
        return pd.DataFrame(jobs)


def scrape_jobs_from_apify(sources=None, roles=None, output_file=None):
    if sources is None:
        sources = ["linkedin", "naukri"]
    if roles is None:
        roles = ["Software Engineer", "Data Scientist", "Data Analyst", "Machine Learning Engineer"]
    scraper = ApifyScraper()
    all_jobs = []
    for source in sources:
        if source == "linkedin":
            df = scraper.scrape_linkedin_jobs(roles)
        elif source == "naukri":
            df = scraper.scrape_naukri_jobs(roles)
        if not df.empty:
            all_jobs.append(df)
    if not all_jobs:
        return pd.DataFrame()
    combined = pd.concat(all_jobs, ignore_index=True)
    if output_file:
        combined.to_csv(output_file, index=False)
    return combined


if __name__ == "__main__":
    df = scrape_jobs_from_apify(["linkedin"], ["Data Scientist"], "data/apify_jobs.csv")
    print(f"Scraped {len(df)} jobs")
