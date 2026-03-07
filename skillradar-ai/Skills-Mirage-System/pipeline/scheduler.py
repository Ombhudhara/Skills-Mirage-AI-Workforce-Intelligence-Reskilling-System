"""
Scheduler for automated job scraping
Runs every 6 hours as per spec
"""

import time
import logging
import threading
from datetime import datetime
from typing import Callable, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class JobScraperScheduler:
    """
    Scheduler for periodic job scraping (every 6 hours)
    """
    
    def __init__(self, interval_hours: int = 6):
        self.interval_seconds = interval_hours * 3600
        self.running = False
        self.thread: Optional[threading.Thread] = None
        self.scraper_func: Optional[Callable] = None
        self.roles: List[str] = [
            "Software Engineer", "Data Scientist", "Data Analyst",
            "Machine Learning Engineer", "Full Stack Developer",
            "DevOps Engineer", "Product Manager", "Business Analyst"
        ]
        self.sources: List[str] = ["linkedin", "naukri"]
    
    def set_scraper_function(self, func: Callable):
        """Set the scraping function to be called"""
        self.scraper_func = func
    
    def set_roles(self, roles: List[str]):
        """Set roles to scrape"""
        self.roles = roles
    
    def set_sources(self, sources: List[str]):
        """Set data sources to scrape from"""
        self.sources = sources
    
    def _run_loop(self):
        """Main scheduler loop"""
        logger.info(f"Scheduler started. Running every {self.interval_seconds/3600} hours")
        while self.running:
            try:
                logger.info(f"[{datetime.now()}] Starting scheduled scrape...")
                if self.scraper_func:
                    self.scraper_func(roles=self.roles, sources=self.sources)
                else:
                    logger.warning("No scraper function configured")
                logger.info(f"[{datetime.now()}] Scheduled scrape completed")
            except Exception as e:
                logger.error(f"Error in scheduled scrape: {e}")
            
            # Sleep in small increments to allow stopping
            for _ in range(int(self.interval_seconds / 10)):
                if not self.running:
                    break
                time.sleep(10)
    
    def start(self):
        """Start the scheduler"""
        if self.running:
            logger.warning("Scheduler already running")
            return
        self.running = True
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()
        logger.info("Scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        if not self.running:
            return
        self.running = False
        if self.thread:
            self.thread.join(timeout=15)
        logger.info("Scheduler stopped")
    
    def run_once(self):
        """Run scraping once manually"""
        if self.scraper_func:
            self.scraper_func(roles=self.roles, sources=self.sources)
        else:
            logger.warning("No scraper function configured")


# Global scheduler instance
_scheduler: Optional[JobScraperScheduler] = None


def start_scheduler(interval_hours: int = 6, scraper_func: Callable = None, roles: List[str] = None, sources: List[str] = None):
    """Start the global scheduler"""
    global _scheduler
    if _scheduler and _scheduler.running:
        logger.warning("Scheduler already running")
        return _scheduler
    
    _scheduler = JobScraperScheduler(interval_hours)
    if scraper_func:
        _scheduler.set_scraper_function(scraper_func)
    if roles:
        _scheduler.set_roles(roles)
    if sources:
        _scheduler.set_sources(sources)
    
    _scheduler.start()
    return _scheduler


def stop_scheduler():
    """Stop the global scheduler"""
    global _scheduler
    if _scheduler:
        _scheduler.stop()
        _scheduler = None


def run_scrape_now():
    """Trigger immediate scrape"""
    global _scheduler
    if _scheduler:
        _scheduler.run_once()


if __name__ == "__main__":
    # Test scheduler
    def mock_scrape(roles, sources):
        print(f"Scraping {roles} from {sources}")
    
    scheduler = start_scheduler(interval_hours=1, scraper_func=mock_scrape)
    print("Scheduler running. Press Ctrl+C to stop.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_scheduler()
        print("Scheduler stopped")
