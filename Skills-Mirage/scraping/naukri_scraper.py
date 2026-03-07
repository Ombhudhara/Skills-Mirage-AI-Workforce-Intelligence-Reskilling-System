import os
from apify_client import ApifyClient


def scrape_jobs():
    """
    Scrape job listings from Indeed using the Apify API.
    Falls back to realistic mock data if the API call fails or returns no results.
    """

    api_token = os.environ.get(
        "APIFY_API_TOKEN",
        "apify_api_9csZ8ieDiTry5gvm8652xPEinoiXca0A5YRL"
    )

    client = ApifyClient(api_token)

    roles = [
        "data scientist",
        "data analyst",
        "machine learning engineer",
        "financial analyst",
    ]

    jobs = []

    for role in roles:
        run_input = {
            "query": role,
            "location": "India",
            "maxItems": 5,
        }

        # Indeed jobs
        try:
            run = client.actor("misceres/indeed-scraper").call(run_input=run_input)

            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                jobs.append({
                    "job_title": item.get("title", role),
                    "company": item.get("companyName", "Unknown"),
                    "location": item.get("location", "India"),
                    "source": "Indeed",
                })
        except Exception as e:
            print(f"[WARNING] Indeed scraper failed for '{role}': {e}")

        # LinkedIn jobs (optional — may require paid actor)
        try:
            run = client.actor("bebity/linkedin-jobs-scraper").call(run_input=run_input)

            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                jobs.append({
                    "job_title": item.get("title", role),
                    "company": item.get("companyName", "Unknown"),
                    "location": item.get("location", "India"),
                    "source": "LinkedIn",
                })
        except Exception:
            pass  # LinkedIn actor may not be available

    # Fallback: if API returned nothing, use realistic mock data
    if not jobs:
        print("[WARNING] No jobs returned from Apify. Using fallback mock data.")
        jobs = _get_fallback_jobs()

    return jobs


def _get_fallback_jobs():
    """Realistic fallback data so the pipeline never crashes."""
    return [
        {"job_title": "Data Scientist", "company": "Infosys", "location": "Bangalore", "source": "Mock"},
        {"job_title": "Data Analyst", "company": "TCS", "location": "Hyderabad", "source": "Mock"},
        {"job_title": "Machine Learning Engineer", "company": "Wipro", "location": "Pune", "source": "Mock"},
        {"job_title": "Financial Analyst", "company": "HDFC Bank", "location": "Mumbai", "source": "Mock"},
        {"job_title": "Data Scientist", "company": "Accenture", "location": "Chennai", "source": "Mock"},
        {"job_title": "Data Analyst", "company": "Deloitte", "location": "Gurgaon", "source": "Mock"},
        {"job_title": "Machine Learning Engineer", "company": "Amazon", "location": "Bangalore", "source": "Mock"},
        {"job_title": "Python Developer", "company": "Cognizant", "location": "Hyderabad", "source": "Mock"},
        {"job_title": "SQL Data Analyst", "company": "Capgemini", "location": "Noida", "source": "Mock"},
        {"job_title": "Tableau BI Analyst", "company": "IBM", "location": "Bangalore", "source": "Mock"},
        {"job_title": "Excel & Power BI Analyst", "company": "EY", "location": "Mumbai", "source": "Mock"},
        {"job_title": "Statistics Researcher", "company": "IISC", "location": "Bangalore", "source": "Mock"},
        {"job_title": "Deep Learning Engineer", "company": "Google", "location": "Hyderabad", "source": "Mock"},
        {"job_title": "NLP Engineer", "company": "Microsoft", "location": "Bangalore", "source": "Mock"},
        {"job_title": "Financial Data Analyst", "company": "JPMorgan", "location": "Mumbai", "source": "Mock"},
    ]