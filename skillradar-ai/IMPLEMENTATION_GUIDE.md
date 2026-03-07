# SkillRadar AI - Implementation Guide for Dashboard Integration

## Quick Start: How to Integrate Course Recommendations

### 3-Step Integration Process

**STEP 1: Create User Profile**
```javascript
POST /api/profile/create
Body: {
    "name": "John Doe",
    "role": "BPO Executive",
    "salary_lakhs": 3.5,
    "city": "Bangalore",
    "experience_years": 3,
    "current_skills": ["Communication", "CRM"],
    "job_description": "I handle customer support calls, manage CRM systems...",
    "career_goal": "Data Analyst"
}

Response: {
    "user_id": "john_doe_1709763300",
    "analysis": {
        "risk_score": 72.5,
        "risk_level": "High",
        "extracted_skills": ["Communication", "CRM", "Excel"],
        "recommended_skills": [
            {"skill": "Python", "score": 85.2, "priority": "High"},
            {"skill": "SQL", "score": 82.1, "priority": "High"}
        ],
        "learning_timeline_weeks": 12
    }
}
```

**STEP 2: Get Reskilling Path with Courses**
```javascript
POST /api/reskilling/path
Body: {
    "target_role": "Data Analyst",
    "current_skills": ["Excel", "Communication", "CRM"]
}

Response: {
    "target_role": "Data Analyst",
    "estimated_duration_weeks": 10,
    "skill_gap": ["Python", "SQL", "PowerBI"],
    "weekly_plan": [
        {
            "week": 1,
            "topic": "Python Fundamentals",
            "course": "Python for Data Analytics",
            "platform": "NPTEL",
            "hours": 6,
            "url": "https://nptel.ac.in/courses?q=Python+for+Data+Analytics"
        },
        {
            "week": 5,
            "topic": "SQL Basics",
            "course": "Database Management",
            "platform": "SWAYAM",
            "hours": 5,
            "url": "https://swayam.gov.in/explorer?searchText=Database+Management"
        }
    ],
    "recommended_courses": [
        {
            "course_name": "Python for Data Analytics",
            "provider": "NPTEL",
            "skills_covered": ["Python", "Data Analytics"],
            "duration_weeks": 8,
            "rating": 4.5,
            "course_score": 82.3,
            "gap_skills_covered": ["Python"],
            "url": "https://..."
        }
    ]
}
```

**STEP 3: Render on Dashboard**
```javascript
// Display weekly timeline
reskillPath.weekly_plan.forEach(week => {
    const card = createWeekCard({
        week: week.week,
        title: week.topic,
        course: week.course,
        platform: week.platform,
        hours: week.hours,
        courseUrl: week.url
    });
    timeline.appendChild(card);
});

// Display recommended courses
reskillPath.recommended_courses.forEach(course => {
    const courseCard = createCourseCard({
        name: course.course_name,
        provider: course.provider,
        duration: `${course.duration_weeks} weeks`,
        rating: course.rating,
        score: course.course_score,
        skills: course.gap_skills_covered,
        url: course.url
    });
    courseList.appendChild(courseCard);
});
```

---

## Key Data to Display on Dashboard

### From Profile Creation (/api/profile/create):
1. **Risk Score**: 0-100 scale
2. **Risk Level**: "Low", "Moderate", "High"
3. **Extracted Skills**: Skills NLP found in job description
4. **Recommended Skills**: Top 5 skills to learn
5. **Alternative Roles**: Safe job options
6. **Learning Timeline**: Weeks to upskill

### From Reskilling Path (/api/reskilling/path):
1. **Weekly Plan**: Array of week-by-week courses
2. **Skill Gap**: Missing skills to learn
3. **Recommended Courses**: Ranked by CourseScore
4. **Duration**: Total weeks needed
5. **Course URLs**: Direct links to NPTEL/SWAYAM

### From Dashboard Data (/api/dashboard/data):
1. **Top Trends**: Hot job roles with demand
2. **Top Skills**: Trending skills in market
3. **Hiring Chart**: By city or role
4. **Company Data**: Top hiring companies
5. **Recommended Courses**: Based on top roles

---

## Important Formulas (For Dashboard Display)

### Risk Score Breakdown (6 Factors):
RiskScore = 0.25×H + 0.20×A + 0.20×SR + 0.15×I + 0.10×SL + 0.10×TA

Where:
- H: Hiring Decline (are jobs decreasing in this role?)
- A: AI Mentions (automation keywords in postings)
- SR: Skill Redundancy (are these skills automatable?)
- I: Industry Automation (is industry adopting automation?)
- SL: Salary Decline (is salary decreasing?)
- TA: Task Automation (how automatable are the tasks?)

### Course Scoring (For Rankings):
CourseScore = 0.50×Coverage + 0.30×Duration + 0.20×Rating

Where:
- Coverage: How many gap skills does course address?
- Duration: Does course duration match available weeks?
- Rating: Course rating (0-5 scale normalized to 0-1)

### Skill Priority Scoring:
SkillScore = 0.40×Trend + 0.35×Gap + 0.25×Transfer

Where:
- Trend: Is skill growing in market?
- Gap: Is it in the skill gap?
- Transfer: How much does it help for target role?

### Career Transition Ease:
TransferScore = Matching Skills / Required Skills for Target Role
- 0.4+ → Easy transition (recommended)
- <0.4 → Difficult transition (needs upskilling)

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Response Key |
|----------|--------|---------|--------------|
| `/api/profile/create` | POST | Create user profile | user_id, analysis.risk_score |
| `/api/profile/view/{user_id}` | GET | Retrieve profile | profile, analysis |
| `/api/reskilling/path` | POST | Get course recommendations | weekly_plan, recommended_courses |
| `/api/dashboard/data` | GET | Market intelligence | trends, skills_demand, courses |
| `/api/intelligence/evaluate` | POST | Risk assessment | risk_score, risk_factors |
| `/api/labour_market/*` | GET | Job market data | role_data, salary_data |
| `/api/chatbot/*` | POST | Chat interface | chat_response |

---

## Complete Example: Dashboard Integration

```javascript
// 1. User submits profile
async function handleProfileSubmit(formData) {
    const res = await fetch('/api/profile/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            name: formData.name,
            role: formData.currentRole,
            salary_lakhs: formData.salary,
            city: formData.city,
            experience_years: formData.experience,
            current_skills: formData.skills,
            job_description: formData.jobDesc,
            career_goal: formData.targetRole
        })
    });
    
    const profile = await res.json();
    window.userId = profile.user_id;
    
    // Display risk analysis
    displayRiskCard(profile.analysis);
    return profile;
}

// 2. User clicks "Get Reskilling Path"
async function handleReskillingRequest(targetRole, currentSkills) {
    const res = await fetch('/api/reskilling/path', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            target_role: targetRole,
            current_skills: currentSkills
        })
    });
    
    const reskilling = await res.json();
    
    // Display timeline
    displayTimeline(reskilling.weekly_plan);
    
    // Display recommended courses
    displayCourses(reskilling.recommended_courses);
    
    // Display duration estimate
    document.querySelector('#duration').textContent = 
        `${reskilling.estimated_duration_weeks} weeks`;
    
    return reskilling;
}

// 3. Display weekly timeline
function displayTimeline(weeklyPlan) {
    const timeline = document.querySelector('#timeline');
    timeline.innerHTML = '';
    
    weeklyPlan.forEach(week => {
        const card = document.createElement('div');
        card.className = 'timeline-card';
        card.innerHTML = `
            <div class="week-number">Week ${week.week}</div>
            <div class="week-topic">${week.topic}</div>
            <div class="course-info">
                <strong>${week.course}</strong><br/>
                Platform: ${week.platform}<br/>
                Hours: ${week.hours}
            </div>
            <a href="${week.url}" target="_blank" class="btn btn-primary">
                Enroll Now
            </a>
        `;
        timeline.appendChild(card);
   
