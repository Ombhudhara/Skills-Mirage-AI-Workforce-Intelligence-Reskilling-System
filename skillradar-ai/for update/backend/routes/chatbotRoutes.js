import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { Groq } from 'groq-sdk';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to the datasets provided in the advanced Python skill-mirage system
const BASE_DIR = path.resolve(__dirname, '../../../Skills-Mirage-System');
const JOBS_PATH = path.join(BASE_DIR, 'data/jobs.csv');
const COURSES_PATH = path.join(BASE_DIR, 'data/courses_processed.csv');

// Load datasets into memory
let jobsData = [];
let coursesData = [];

try {
    if (fs.existsSync(JOBS_PATH)) {
        const fileContent = fs.readFileSync(JOBS_PATH, 'utf-8');
        jobsData = parse(fileContent, { columns: true, skip_empty_lines: true });
    }
    if (fs.existsSync(COURSES_PATH)) {
        const fileContent = fs.readFileSync(COURSES_PATH, 'utf-8');
        coursesData = parse(fileContent, { columns: true, skip_empty_lines: true });
    }
} catch (error) {
    console.error("Error loading Skill-Mirage-System datasets:", error);
}

// Generate the course context string
const generateCourseContext = () => {
    if (!coursesData.length) return "";
    // Reduce from 25 to 10 to save tokens
    const courses = coursesData.slice(0, 10).map(row =>
        `Course: ${row.course_name} | Provider: ${row.provider} | Skill: ${row.skills_covered}`
    ).join("\n");
    return "Local Courses Data:\n" + courses;
};

// Generate job market context based on query
const generateJobContext = (query) => {
    let temp_df = [...jobsData];

    const lowerQuery = query.toLowerCase();
    const mentionedCities = [...new Set(jobsData.map(j => j.city))].filter(c => c && lowerQuery.includes(c.toLowerCase()));

    if (mentionedCities.length > 0) {
        temp_df = [
            ...temp_df.filter(j => mentionedCities.includes(j.city)),
            ...temp_df.filter(j => !mentionedCities.includes(j.city))
        ];
    }

    // Reduce from 30 to 15 to save tokens
    const jobLines = temp_df.slice(0, 15).map(j =>
        `Role: ${j.role} | City: ${j.city} | Salary: ₹${j.salary_min}-${j.salary_max} LPA | Skills: ${j.skills}`
    ).join("\n");

    return "Local Jobs Data:\n" + jobLines;
};

router.post('/message', async (req, res) => {
    try {
        const { message, language = "English" } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY environment variable is not set.");
        }

        const groq = new Groq({ apiKey });

        const marketContext = generateJobContext(message);
        const courseContext = generateCourseContext();

        const systemPrompt = `You are the SkillMirage AI Strategist. 
You help workers navigate the transition from routine roles to AI-resistant careers.

CRITICAL INSTRUCTION: You MUST reply entirely in ${language}. 
If ${language} is 'Hindi', you MUST use PURE HINDI (not hinglish).
If ${language} is 'English', you MUST reply entirely in English.

DATA CONTEXT:
${marketContext}
${courseContext}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama-3.1-8b-instant", // Smaller model = Higher free-tier rate limits
            temperature: 0.1,
            max_tokens: 1024
        });

        const reply = completion.choices[0]?.message?.content || "I am unable to process your request at this time.";
        res.json({ reply });
    } catch (error) {
        console.error("Chatbot completion error:", error);

        // Return clear error for rate limits
        if (error.status === 429) {
            return res.status(429).json({ error: "API Rate limited. Please try again in 60s." });
        }

        res.status(500).json({ error: "Chatbot engine failed to respond." });
    }
});

export default router;
