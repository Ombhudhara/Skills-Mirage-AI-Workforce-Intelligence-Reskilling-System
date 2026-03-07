#!/usr/bin/env python
"""
Test User Profile Creation API
Tests the complete flow: form -> NLP extraction -> risk assessment -> recommendations
"""
import sys
import os
import json

SKILLS_MIRAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "skills_mirage")
sys.path.insert(0, SKILLS_MIRAGE_DIR)

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))
sys.path.insert(0, os.getcwd())

from api.profile import CreateProfileRequest, create_user_profile
from main import skillradar_data
from pipeline.data_pipeline import build_pipeline

# Load data
print("Loading data pipeline...")
if not skillradar_data.get("jobs"):
    jobs_df, courses_df = build_pipeline(force=False, enable_scraping=False)
    skillradar_data["jobs"] = jobs_df
    skillradar_data["courses"] = courses_df

print(f"Jobs loaded: {len(skillradar_data['jobs'])} records")

# Test 1: Data Entry Operator (High Risk)
print("\n" + "="*80)
print("TEST 1: Data Entry Operator (High Risk Profile)")
print("="*80)

request1 = CreateProfileRequest(
    name="Ravi Kumar",
    role="Data Entry Operator",
    salary_lakhs=3.5,
    city="Delhi",
    experience_years=2,
    current_skills=["Excel", "MS Office", "Data Entry"],
    job_description="""I work as a Data Entry Operator at an accounting firm.
    My daily tasks include:
    - Entering financial data into Excel spreadsheets
    - Copy-pasting data from PDFs to databases
    - Verifying data accuracy
    - Creating simple reports in Excel
    - Maintaining data files and backups
    - Following data entry guidelines and quality standards
    
    I use Excel formulas, basic SQL for database entry, and typing speed is my main skill.
    I don't use any programming languages or advanced tools.
    Most of my work involves repetitive data input tasks.""",
    career_goal="Senior Data Entry Coordinator"
)

result1 = create_user_profile(request1)
print(f"\n✓ Profile created: {result1['user_id']}")
print(f"\nRisk Score: {result1['analysis']['risk_score']:.1f}/100 ({result1['analysis']['risk_level']})")
print(f"Extracted Skills: {', '.join(result1['analysis']['extracted_skills'][:5])}")
print(f"\nTop 3 Recommended Skills:")
for rec in result1['analysis']['recommended_skills'][:3]:
    print(f"  - {rec['skill']}: Score {rec['score']:.1f} ({rec['priority']} Priority)")
print(f"\nKey Insights:")
for insight in result1['analysis']['key_insights']:
    print(f"  • {insight}")

# Test 2: Software Engineer (Low Risk)
print("\n" + "="*80)
print("TEST 2: Software Engineer (Low Risk Profile)")
print("="*80)

request2 = CreateProfileRequest(
    name="Priya Sharma",
    role="Software Engineer",
    salary_lakhs=12.5,
    city="Bangalore",
    experience_years=5,
    current_skills=["Python", "JavaScript", "React", "SQL", "AWS", "Docker"],
    job_description="""I'm a Full Stack Software Engineer working at a tech startup.
    My responsibilities include:
    - Designing and developing scalable microservices using Python and Node.js
    - Building responsive web applications with React and TypeScript
    - Implementing CI/CD pipelines using Jenkins and GitHub Actions
    - Managing cloud infrastructure on AWS (EC2, S3, Lambda)
    - Writing unit tests and integration tests
    - Code reviews and mentoring junior developers
    - Architecting database solutions with PostgreSQL and NoSQL
    - Participating in design discussions and technical decision-making
    
    I work with modern development practices like Agile, TDD, and pair programming.
    I'm currently learning Kubernetes and ML engineering concepts.
    I contribute to open-source projects in my free time.""",
    career_goal="Lead Software Architect"
)

result2 = create_user_profile(request2)
print(f"\n✓ Profile created: {result2['user_id']}")
print(f"\nRisk Score: {result2['analysis']['risk_score']:.1f}/100 ({result2['analysis']['risk_level']})")
print(f"Extracted Skills: {', '.join(result2['analysis']['extracted_skills'][:5])}")
print(f"\nTop 3 Recommended Skills:")
for rec in result2['analysis']['recommended_skills'][:3]:
    print(f"  - {rec['skill']}: Score {rec['score']:.1f} ({rec['priority']} Priority)")
print(f"\nKey Insights:")
for insight in result2['analysis']['key_insights']:
    print(f"  • {insight}")

# Test 3: Business Analyst (Moderate Risk)
print("\n" + "="*80)
print("TEST 3: Business Analyst (Moderate Risk Profile)")
print("="*80)

request3 = CreateProfileRequest(
    name="Amit Patel",
    role="Business Analyst",
    salary_lakhs=8.0,
    city="Mumbai",
    experience_years=4,
    current_skills=["Excel", "SQL", "Tableau", "JIRA"],
    job_description="""I work as a Business Analyst at a financial services company.
    My daily work involves:
    - Analyzing business requirements and translating them to technical specs
    - Creating dashboards and reports in Tableau
    - Writing SQL queries to extract and analyze data
    - Using Excel for data analysis, pivot tables, and financial modeling
    - Documentation and process mapping using Visio
    - Attending client meetings and gathering requirements
    - Testing and validating system changes
    - Creating user stories and acceptance criteria
    - Coordinating with development and QA teams
    
    I have some exposure to Python but don't code regularly.
    I'm working on improving my SQL and learning basic data science concepts.""",
    career_goal="Senior Business Analyst / Solutions Architect"
)

result3 = create_user_profile(request3)
print(f"\n✓ Profile created: {result3['user_id']}")
print(f"\nRisk Score: {result3['analysis']['risk_score']:.1f}/100 ({result3['analysis']['risk_level']})")
print(f"Extracted Skills: {', '.join(result3['analysis']['extracted_skills'][:5])}")
print(f"\nTop 3 Recommended Skills:")
for rec in result3['analysis']['recommended_skills'][:3]:
    print(f"  - {rec['skill']}: Score {rec['score']:.1f} ({rec['priority']} Priority)")
print(f"\nKey Insights:")
for insight in result3['analysis']['key_insights']:
    print(f"  • {insight}")

# Test 4: Skill Extraction Preview
print("\n" + "="*80)
print("TEST 4: Quick Risk Assessment (Without Full Profile)")
print("="*80)

from api.profile import quick_risk_assessment

risk_result = quick_risk_assessment(
    role="Data Analyst",
    description="""I analyze large datasets using Python and SQL.
    I create interactive dashboards using PowerBI.
    I prepare reports for stakeholders and management.
    I use Excel for quick analysis and visualization.
    I'm familiar with statistical concepts and A/B testing.""",
    skills=["Python", "SQL", "Excel"],
    salary_lakhs=6.5,
    city="Bangalore"
)

print(f"\nQuick Assessment Results:")
print(f"Risk Score: {risk_result['risk_score']:.1f}/100 ({risk_result['risk_level']})")
print(f"Recommendation: {risk_result['recommendation']}")
print(f"\nExtracted Skills from Description:")
print(f"  {', '.join(risk_result['extracted_skills'])}")

# Summary
print("\n" + "="*80)
print("TEST SUMMARY")
print("="*80)
print("""
✓ Test 1 (High Risk - Data Entry Operator): Success
  - Profile ID: {}
  - Risk Score: {:.1f}/100
  
✓ Test 2 (Low Risk - Software Engineer): Success
  - Profile ID: {}
  - Risk Score: {:.1f}/100
  
✓ Test 3 (Moderate Risk - Business Analyst): Success
  - Profile ID: {}
  - Risk Score: {:.1f}/100
  
✓ Test 4 (Quick Assessment): Success
  - Risk Score: {:.1f}/100

All tests completed successfully!
Profiles are stored in: skills_mirage/data/profiles/

Next: Open http://localhost:3000/profile in your browser to create profiles via the UI
""".format(
    result1['user_id'], result1['analysis']['risk_score'],
    result2['user_id'], result2['analysis']['risk_score'],
    result3['user_id'], result3['analysis']['risk_score'],
    risk_result['risk_score']
))
