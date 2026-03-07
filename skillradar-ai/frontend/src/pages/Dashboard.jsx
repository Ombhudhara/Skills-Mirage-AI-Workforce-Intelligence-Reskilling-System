import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, LabelList
} from 'recharts';
import { getDashboardData, getReskillingTimeline } from '../api/client';
import {
    AlertTriangle, Briefcase, MapPin, TrendingUp, Radio, Clock,
    ShieldAlert, Zap, Database, Activity, LayoutGrid, Building2, Users, Globe, IndianRupee, Calendar,
    BarChart3
} from 'lucide-react';

import DrillDownPanel from '../components/DrillDownPanel';
import DisplacementWarning from '../components/DisplacementWarning';

// ── Mock Data ───────────────────────────────────────────────────────────────

const TIME_PERIODS = ['7 Days', '1 Month', '6 Months', '1 Year'];

const sectorGrowthByPeriod = {
    '7 Days': [
        { month: 'Mon', Technology: 28, Finance: 18, Healthcare: 14, Retail: 9, Manufacturing: 6 },
        { month: 'Tue', Technology: 32, Finance: 20, Healthcare: 16, Retail: 8, Manufacturing: 7 },
        { month: 'Wed', Technology: 30, Finance: 19, Healthcare: 15, Retail: 10, Manufacturing: 5 },
        { month: 'Thu', Technology: 35, Finance: 22, Healthcare: 18, Retail: 11, Manufacturing: 6 },
        { month: 'Fri', Technology: 38, Finance: 24, Healthcare: 20, Retail: 12, Manufacturing: 7 },
        { month: 'Sat', Technology: 25, Finance: 15, Healthcare: 12, Retail: 8, Manufacturing: 4 },
        { month: 'Sun', Technology: 22, Finance: 12, Healthcare: 10, Retail: 6, Manufacturing: 3 },
    ],
    '1 Month': [
        { month: 'Week 1', Technology: 120, Finance: 95, Healthcare: 80, Retail: 60, Manufacturing: 50 },
        { month: 'Week 2', Technology: 135, Finance: 100, Healthcare: 88, Retail: 55, Manufacturing: 48 },
        { month: 'Week 3', Technology: 150, Finance: 98, Healthcare: 95, Retail: 52, Manufacturing: 45 },
        { month: 'Week 4', Technology: 170, Finance: 110, Healthcare: 102, Retail: 58, Manufacturing: 42 },
    ],
    '6 Months': [
        { month: 'Jan', Technology: 120, Finance: 95, Healthcare: 80, Retail: 60, Manufacturing: 50 },
        { month: 'Feb', Technology: 135, Finance: 100, Healthcare: 88, Retail: 55, Manufacturing: 48 },
        { month: 'Mar', Technology: 150, Finance: 98, Healthcare: 95, Retail: 52, Manufacturing: 45 },
        { month: 'Apr', Technology: 170, Finance: 110, Healthcare: 102, Retail: 58, Manufacturing: 42 },
        { month: 'May', Technology: 190, Finance: 115, Healthcare: 110, Retail: 62, Manufacturing: 40 },
        { month: 'Jun', Technology: 210, Finance: 108, Healthcare: 118, Retail: 65, Manufacturing: 38 },
    ],
    '1 Year': [
        { month: 'Jan', Technology: 90, Finance: 72, Healthcare: 60, Retail: 55, Manufacturing: 52 },
        { month: 'Mar', Technology: 110, Finance: 80, Healthcare: 70, Retail: 52, Manufacturing: 48 },
        { month: 'May', Technology: 135, Finance: 88, Healthcare: 82, Retail: 50, Manufacturing: 45 },
        { month: 'Jul', Technology: 155, Finance: 95, Healthcare: 90, Retail: 48, Manufacturing: 42 },
        { month: 'Sep', Technology: 180, Finance: 102, Healthcare: 100, Retail: 46, Manufacturing: 40 },
        { month: 'Nov', Technology: 210, Finance: 108, Healthcare: 118, Retail: 44, Manufacturing: 38 },
    ],
};

const sectorGrowth = sectorGrowthByPeriod['6 Months'];

const statsByPeriod = {
    '7 Days': { jobs: '2,140', growth: '+3.2%', risk: 3, salary: '₹7.6 LPA', salSub: '+0.4% WoW' },
    '1 Month': { jobs: '8,620', growth: '+8.1%', risk: 8, salary: '₹7.5 LPA', salSub: '+1.2% MoM' },
    '6 Months': { jobs: '15,036', growth: '+12.4%', risk: 14, salary: '₹7.4 LPA', salSub: '+9% HY' },
    '1 Year': { jobs: '28,450', growth: '+18.6%', risk: 22, salary: '₹7.1 LPA', salSub: '+18% YoY' },
};

const hiringByPeriod = {
    '7 Days': [
        { company: 'Google', postings: 185 },
        { company: 'TCS', postings: 420 },
        { company: 'Infosys', postings: 310 },
        { company: 'Amazon', postings: 220 },
        { company: 'Microsoft', postings: 175 },
        { company: 'Accenture', postings: 280 },
    ],
    '1 Month': [
        { company: 'Google', postings: 680 },
        { company: 'TCS', postings: 1540 },
        { company: 'Infosys', postings: 1120 },
        { company: 'Amazon', postings: 850 },
        { company: 'Microsoft', postings: 640 },
        { company: 'Accenture', postings: 980 },
    ],
    '6 Months': [
        { company: 'Google', postings: 1420 },
        { company: 'TCS', postings: 2850 },
        { company: 'Infosys', postings: 2200 },
        { company: 'Amazon', postings: 1680 },
        { company: 'Microsoft', postings: 1350 },
        { company: 'Accenture', postings: 1920 },
    ],
    '1 Year': [
        { company: 'Google', postings: 3200 },
        { company: 'TCS', postings: 6100 },
        { company: 'Infosys', postings: 4800 },
        { company: 'Amazon', postings: 3650 },
        { company: 'Microsoft', postings: 2900 },
        { company: 'Accenture', postings: 4100 },
    ],
};

const roleDemandByPeriod = {
    '7 Days': [
        { role: 'Data Engineer', demand: 82, growth: '+4%' },
        { role: 'Data Scientist', demand: 75, growth: '+5%' },
        { role: 'AI Engineer', demand: 90, growth: '+7%' },
        { role: 'Cloud Architect', demand: 70, growth: '+3%' },
        { role: 'AI Ethics Specialist', demand: 60, growth: '+6%' },
    ],
    '1 Month': [
        { role: 'Data Engineer', demand: 84, growth: '+12%' },
        { role: 'Data Scientist', demand: 76, growth: '+14%' },
        { role: 'AI Engineer', demand: 91, growth: '+18%' },
        { role: 'Cloud Architect', demand: 72, growth: '+10%' },
        { role: 'AI Ethics Specialist', demand: 62, growth: '+20%' },
    ],
    '6 Months': [
        { role: 'Data Engineer', demand: 85, growth: '+28%' },
        { role: 'Data Scientist', demand: 78, growth: '+32%' },
        { role: 'AI Engineer', demand: 92, growth: '+42%' },
        { role: 'Cloud Architect', demand: 74, growth: '+35%' },
        { role: 'AI Ethics Specialist', demand: 65, growth: '+55%' },
    ],
    '1 Year': [
        { role: 'Data Engineer', demand: 88, growth: '+45%' },
        { role: 'Data Scientist', demand: 82, growth: '+52%' },
        { role: 'AI Engineer', demand: 95, growth: '+68%' },
        { role: 'Cloud Architect', demand: 79, growth: '+55%' },
        { role: 'AI Ethics Specialist', demand: 72, growth: '+80%' },
    ],
};

// Static displacementAlerts removed as it is now dynamically generated based on city and role filters.


const SECTOR_COLORS = {
    Technology: '#7b2cbf',
    Finance: '#3f37c9',
    Healthcare: '#4361ee',
    Retail: '#4cc9f0',
    Manufacturing: '#f72585',
};

// Feature 1: defaults (unused directly now, driven by period)
const topHiringCompanies = hiringByPeriod['6 Months'];
const roleDemandData = roleDemandByPeriod['6 Months'];

// Feature 5: Year-wise Job Demand Trend (2020-2030)
const yearwiseTrend = [
    { year: '2020', Technology: 45000, Finance: 32000, Healthcare: 28000, Retail: 22000, Manufacturing: 18000 },
    { year: '2021', Technology: 52000, Finance: 35000, Healthcare: 31000, Retail: 20000, Manufacturing: 17000 },
    { year: '2022', Technology: 68000, Finance: 38000, Healthcare: 35000, Retail: 19000, Manufacturing: 16000 },
    { year: '2023', Technology: 82000, Finance: 42000, Healthcare: 40000, Retail: 18500, Manufacturing: 15000 },
    { year: '2024', Technology: 95000, Finance: 45000, Healthcare: 48000, Retail: 18000, Manufacturing: 14500 },
    { year: '2025', Technology: 110000, Finance: 48000, Healthcare: 55000, Retail: 17500, Manufacturing: 14000 },
    { year: '2026', Technology: 128000, Finance: 52000, Healthcare: 62000, Retail: 17000, Manufacturing: 13500 },
    { year: '2027', Technology: 145000, Finance: 55000, Healthcare: 70000, Retail: 16500, Manufacturing: 13000 },
    { year: '2028', Technology: 165000, Finance: 58000, Healthcare: 78000, Retail: 16000, Manufacturing: 12500 },
    { year: '2029', Technology: 185000, Finance: 60000, Healthcare: 85000, Retail: 15500, Manufacturing: 12000 },
    { year: '2030', Technology: 210000, Finance: 62000, Healthcare: 92000, Retail: 15000, Manufacturing: 11500 },
];

// Feature 3: City-specific metrics
const cityMetrics = {
    'Bangalore': { hiringVelocity: '+18.2%', talentDensity: 96.1, marketScore: 92 },
    'Mumbai': { hiringVelocity: '+12.5%', talentDensity: 88.4, marketScore: 85 },
    'Delhi': { hiringVelocity: '+14.2%', talentDensity: 92.4, marketScore: 78 },
    'Hyderabad': { hiringVelocity: '+16.8%', talentDensity: 90.2, marketScore: 88 },
    'Pune': { hiringVelocity: '+10.4%', talentDensity: 82.5, marketScore: 76 },
    'Chennai': { hiringVelocity: '+11.1%', talentDensity: 79.8, marketScore: 74 },
    'Gurgaon': { hiringVelocity: '+15.6%', talentDensity: 85.0, marketScore: 80 },
    'Gurugram': { hiringVelocity: '+15.2%', talentDensity: 84.8, marketScore: 79 },
    'Ahmedabad': { hiringVelocity: '+9.8%', talentDensity: 78.2, marketScore: 72 },
    'Indore': { hiringVelocity: '+8.5%', talentDensity: 75.4, marketScore: 68 },
    'Jaipur': { hiringVelocity: '+7.2%', talentDensity: 72.1, marketScore: 65 },
    'Chandigarh': { hiringVelocity: '+11.3%', talentDensity: 81.6, marketScore: 75 },
    'Lucknow': { hiringVelocity: '+6.8%', talentDensity: 70.3, marketScore: 62 },
    'Kochi': { hiringVelocity: '+13.5%', talentDensity: 87.2, marketScore: 82 },
    'Visakhapatnam': { hiringVelocity: '+9.2%', talentDensity: 76.8, marketScore: 70 },
    'Surat': { hiringVelocity: '+10.1%', talentDensity: 79.5, marketScore: 71 },
    'Vadodara': { hiringVelocity: '+8.9%', talentDensity: 77.1, marketScore: 69 },
    'Nagpur': { hiringVelocity: '+7.6%', talentDensity: 73.4, marketScore: 66 },
    'Ranchi': { hiringVelocity: '+6.2%', talentDensity: 69.2, marketScore: 61 },
    'Thiruvananthapuram': { hiringVelocity: '+12.1%', talentDensity: 85.3, marketScore: 80 },
    'Bhopal': { hiringVelocity: '+7.3%', talentDensity: 72.8, marketScore: 64 },
    'Coimbatore': { hiringVelocity: '+10.8%', talentDensity: 81.2, marketScore: 73 },
    'Nashik': { hiringVelocity: '+6.5%', talentDensity: 70.9, marketScore: 63 },
    'Aurangabad': { hiringVelocity: '+5.8%', talentDensity: 68.6, marketScore: 60 },
    'Amritsar': { hiringVelocity: '+6.9%', talentDensity: 71.4, marketScore: 64 },
    'Ludhiana': { hiringVelocity: '+7.1%', talentDensity: 72.0, marketScore: 65 },
    'Guwahati': { hiringVelocity: '+8.3%', talentDensity: 74.6, marketScore: 67 },
    'Noida': { hiringVelocity: '+13.8%', talentDensity: 89.1, marketScore: 84 },
    'Kolkata': { hiringVelocity: '+9.5%', talentDensity: 77.9, marketScore: 71 },
};

// City-specific hiring companies
const cityHiringCompanies = {
    'Bangalore': [
        { company: 'Google', postings: 520 },
        { company: 'Infosys', postings: 890 },
        { company: 'Wipro', postings: 680 },
        { company: 'Amazon', postings: 450 },
        { company: 'Flipkart', postings: 380 },
        { company: 'Accenture', postings: 610 },
    ],
    'Mumbai': [
        { company: 'TCS', postings: 920 },
        { company: 'Deloitte', postings: 540 },
        { company: 'JPMorgan', postings: 420 },
        { company: 'Reliance', postings: 680 },
        { company: 'HDFC Bank', postings: 350 },
        { company: 'Accenture', postings: 480 },
    ],
    'Delhi': [
        { company: 'HCL', postings: 620 },
        { company: 'Adobe', postings: 340 },
        { company: 'Paytm', postings: 280 },
        { company: 'TCS', postings: 550 },
        { company: 'Infosys', postings: 430 },
        { company: 'EY', postings: 380 },
    ],
    'Hyderabad': [
        { company: 'Microsoft', postings: 480 },
        { company: 'Google', postings: 350 },
        { company: 'Amazon', postings: 420 },
        { company: 'Infosys', postings: 550 },
        { company: 'Deloitte', postings: 310 },
        { company: 'TCS', postings: 490 },
    ],
    'Pune': [
        { company: 'Infosys', postings: 520 },
        { company: 'Wipro', postings: 440 },
        { company: 'TCS', postings: 480 },
        { company: 'Persistent', postings: 280 },
        { company: 'Cognizant', postings: 350 },
        { company: 'Capgemini', postings: 310 },
    ],
    'Chennai': [
        { company: 'TCS', postings: 680 },
        { company: 'Cognizant', postings: 440 },
        { company: 'Infosys', postings: 380 },
        { company: 'Zoho', postings: 320 },
        { company: 'Wipro', postings: 290 },
        { company: 'Capgemini', postings: 260 },
    ],
    'Gurgaon': [
        { company: 'Google', postings: 280 },
        { company: 'Accenture', postings: 420 },
        { company: 'American Express', postings: 310 },
        { company: 'Samsung', postings: 250 },
        { company: 'Deloitte', postings: 340 },
        { company: 'TCS', postings: 380 },
    ],
    'Gurugram': [
        { company: 'Google', postings: 270 },
        { company: 'Accenture', postings: 400 },
        { company: 'Samsung', postings: 240 },
        { company: 'Deloitte', postings: 330 },
        { company: 'Amazon', postings: 290 },
        { company: 'Microsoft', postings: 310 },
    ],
    'Ahmedabad': [
        { company: 'HCL', postings: 180 },
        { company: 'TCS', postings: 220 },
        { company: 'Infosys', postings: 190 },
        { company: 'Cognizant', postings: 150 },
        { company: 'Wipro', postings: 140 },
        { company: 'Adobe', postings: 120 },
    ],
    'Indore': [
        { company: 'Infosys', postings: 140 },
        { company: 'TCS', postings: 160 },
        { company: 'Cognizant', postings: 110 },
        { company: 'HCL', postings: 130 },
        { company: 'Wipro', postings: 100 },
        { company: 'Accenture', postings: 90 },
    ],
    'Jaipur': [
        { company: 'HCL', postings: 120 },
        { company: 'TCS', postings: 140 },
        { company: 'Infosys', postings: 110 },
        { company: 'Cognizant', postings: 90 },
        { company: 'Accenture', postings: 80 },
        { company: 'Wipro', postings: 70 },
    ],
    'Chandigarh': [
        { company: 'Samsung', postings: 210 },
        { company: 'Infosys', postings: 240 },
        { company: 'TCS', postings: 200 },
        { company: 'HCL', postings: 170 },
        { company: 'Cognizant', postings: 140 },
        { company: 'Adobe', postings: 110 },
    ],
    'Lucknow': [
        { company: 'TCS', postings: 100 },
        { company: 'Infosys', postings: 90 },
        { company: 'Cognizant', postings: 70 },
        { company: 'HCL', postings: 80 },
        { company: 'Wipro', postings: 60 },
        { company: 'Accenture', postings: 50 },
    ],
    'Kochi': [
        { company: 'TCS', postings: 380 },
        { company: 'Infosys', postings: 320 },
        { company: 'Cognizant', postings: 220 },
        { company: 'Wipro', postings: 180 },
        { company: 'HCL', postings: 150 },
        { company: 'Accenture', postings: 140 },
    ],
    'Visakhapatnam': [
        { company: 'Infosys', postings: 180 },
        { company: 'TCS', postings: 160 },
        { company: 'Cognizant', postings: 120 },
        { company: 'HCL', postings: 100 },
        { company: 'Wipro', postings: 80 },
        { company: 'Accenture', postings: 70 },
    ],
    'Surat': [
        { company: 'HCL', postings: 150 },
        { company: 'TCS', postings: 170 },
        { company: 'Infosys', postings: 140 },
        { company: 'Cognizant', postings: 100 },
        { company: 'Wipro', postings: 80 },
        { company: 'Accenture', postings: 90 },
    ],
    'Vadodara': [
        { company: 'Infosys', postings: 120 },
        { company: 'TCS', postings: 130 },
        { company: 'HCL', postings: 100 },
        { company: 'Cognizant', postings: 80 },
        { company: 'Wipro', postings: 60 },
        { company: 'Accenture', postings: 70 },
    ],
    'Nagpur': [
        { company: 'TCS', postings: 110 },
        { company: 'Infosys', postings: 100 },
        { company: 'HCL', postings: 80 },
        { company: 'Cognizant', postings: 70 },
        { company: 'Wipro', postings: 50 },
        { company: 'Accenture', postings: 60 },
    ],
    'Ranchi': [
        { company: 'TCS', postings: 80 },
        { company: 'Infosys', postings: 70 },
        { company: 'HCL', postings: 60 },
        { company: 'Cognizant', postings: 50 },
        { company: 'Wipro', postings: 40 },
        { company: 'Accenture', postings: 45 },
    ],
    'Thiruvananthapuram': [
        { company: 'Infosys', postings: 280 },
        { company: 'TCS', postings: 260 },
        { company: 'Cognizant', postings: 180 },
        { company: 'Wipro', postings: 150 },
        { company: 'HCL', postings: 120 },
        { company: 'Accenture', postings: 130 },
    ],
    'Bhopal': [
        { company: 'HCL', postings: 100 },
        { company: 'TCS', postings: 110 },
        { company: 'Infosys', postings: 90 },
        { company: 'Cognizant', postings: 70 },
        { company: 'Wipro', postings: 60 },
        { company: 'Accenture', postings: 65 },
    ],
    'Coimbatore': [
        { company: 'Infosys', postings: 240 },
        { company: 'TCS', postings: 220 },
        { company: 'Cognizant', postings: 150 },
        { company: 'Wipro', postings: 130 },
        { company: 'HCL', postings: 110 },
        { company: 'Accenture', postings: 100 },
    ],
    'Nashik': [
        { company: 'TCS', postings: 90 },
        { company: 'Infosys', postings: 80 },
        { company: 'HCL', postings: 70 },
        { company: 'Cognizant', postings: 60 },
        { company: 'Wipro', postings: 50 },
        { company: 'Accenture', postings: 55 },
    ],
    'Aurangabad': [
        { company: 'TCS', postings: 75 },
        { company: 'Infosys', postings: 65 },
        { company: 'HCL', postings: 55 },
        { company: 'Cognizant', postings: 45 },
        { company: 'Wipro', postings: 35 },
        { company: 'Accenture', postings: 40 },
    ],
    'Amritsar': [
        { company: 'HCL', postings: 85 },
        { company: 'TCS', postings: 95 },
        { company: 'Infosys', postings: 80 },
        { company: 'Cognizant', postings: 60 },
        { company: 'Wipro', postings: 50 },
        { company: 'Accenture', postings: 55 },
    ],
    'Ludhiana': [
        { company: 'TCS', postings: 100 },
        { company: 'Infosys', postings: 90 },
        { company: 'HCL', postings: 80 },
        { company: 'Cognizant', postings: 65 },
        { company: 'Wipro', postings: 55 },
        { company: 'Accenture', postings: 60 },
    ],
    'Guwahati': [
        { company: 'Infosys', postings: 130 },
        { company: 'TCS', postings: 120 },
        { company: 'HCL', postings: 100 },
        { company: 'Cognizant', postings: 80 },
        { company: 'Wipro', postings: 70 },
        { company: 'Accenture', postings: 75 },
    ],
    'Noida': [
        { company: 'Google', postings: 320 },
        { company: 'Amazon', postings: 280 },
        { company: 'Microsoft', postings: 290 },
        { company: 'Adobe', postings: 210 },
        { company: 'Accenture', postings: 280 },
        { company: 'TCS', postings: 340 },
    ],
    'Kolkata': [
        { company: 'TCS', postings: 280 },
        { company: 'Infosys', postings: 240 },
        { company: 'HCL', postings: 180 },
        { company: 'Cognizant', postings: 150 },
        { company: 'Wipro', postings: 120 },
        { company: 'Accenture', postings: 140 },
    ],
};

// City multipliers for stats (how much of total each city represents)
const cityStatMultiplier = {
    'Bangalore': 0.22,
    'Mumbai': 0.18,
    'Delhi': 0.14,
    'Hyderabad': 0.15,
    'Pune': 0.12,
    'Chennai': 0.10,
    'Gurgaon': 0.09,
    'Gurugram': 0.08,
    'Noida': 0.08,
    'Kochi': 0.07,
    'Chandigarh': 0.06,
    'Ahmedabad': 0.06,
    'Coimbatore': 0.05,
    'Thiruvananthapuram': 0.05,
    'Kolkata': 0.05,
    'Indore': 0.04,
    'Jaipur': 0.04,
    'Visakhapatnam': 0.03,
    'Surat': 0.03,
    'Vadodara': 0.03,
    'Nagpur': 0.03,
    'Bhopal': 0.03,
    'Guwahati': 0.02,
    'Lucknow': 0.02,
    'Ranchi': 0.02,
    'Nashik': 0.02,
    'Aurangabad': 0.02,
    'Amritsar': 0.02,
    'Ludhiana': 0.02,
};

const roleStatMultiplier = {
    'Data Scientist': 0.12,
    'ML Engineer': 0.10,
    'Software Engineer': 0.25,
    'Data Engineer': 0.15,
    'AI Engineer': 0.08,
    'Cloud Architect': 0.09,
    'Full Stack Developer': 0.18,
    'Java Developer': 0.22,
    'Python Developer': 0.20,
    'Business Analyst': 0.14,
    'Data Analyst': 0.16,
    'Data Entry Clerk': 0.30
};

// City-specific role demand adjustments
const cityRoleDemandMultiplier = {
    'Bangalore': { 'Data Engineer': 1.15, 'Data Scientist': 1.2, 'AI Engineer': 1.25, 'Cloud Architect': 1.1, 'AI Ethics Specialist': 1.0, 'Software Engineer': 1.18, 'ML Engineer': 1.22, 'Full Stack Developer': 1.12, 'Java Developer': 1.1, 'Python Developer': 1.19 },
    'Mumbai': { 'Data Engineer': 0.9, 'Data Scientist': 0.95, 'AI Engineer': 0.85, 'Cloud Architect': 1.05, 'AI Ethics Specialist': 1.1, 'Software Engineer': 0.92, 'ML Engineer': 0.88, 'Full Stack Developer': 0.94, 'Java Developer': 0.96, 'Python Developer': 0.89 },
    'Delhi': { 'Data Engineer': 0.85, 'Data Scientist': 0.9, 'AI Engineer': 0.8, 'Cloud Architect': 0.95, 'AI Ethics Specialist': 0.9, 'Software Engineer': 0.87, 'ML Engineer': 0.82, 'Full Stack Developer': 0.88, 'Java Developer': 0.91, 'Python Developer': 0.84 },
    'Hyderabad': { 'Data Engineer': 1.1, 'Data Scientist': 1.05, 'AI Engineer': 1.1, 'Cloud Architect': 1.0, 'AI Ethics Specialist': 0.85, 'Software Engineer': 1.08, 'ML Engineer': 1.12, 'Full Stack Developer': 1.06, 'Java Developer': 1.04, 'Python Developer': 1.09 },
    'Pune': { 'Data Engineer': 0.95, 'Data Scientist': 0.85, 'AI Engineer': 0.9, 'Cloud Architect': 0.9, 'AI Ethics Specialist': 0.8, 'Software Engineer': 0.97, 'ML Engineer': 0.87, 'Full Stack Developer': 0.92, 'Java Developer': 0.99, 'Python Developer': 0.86 },
    'Chennai': { 'Data Engineer': 0.85, 'Data Scientist': 0.8, 'AI Engineer': 0.75, 'Cloud Architect': 0.85, 'AI Ethics Specialist': 0.75, 'Software Engineer': 0.83, 'ML Engineer': 0.78, 'Full Stack Developer': 0.82, 'Java Developer': 0.86, 'Python Developer': 0.79 },
    'Gurgaon': { 'Data Engineer': 0.9, 'Data Scientist': 0.95, 'AI Engineer': 0.9, 'Cloud Architect': 1.0, 'AI Ethics Specialist': 0.95, 'Software Engineer': 0.92, 'ML Engineer': 0.91, 'Full Stack Developer': 0.96, 'Java Developer': 0.94, 'Python Developer': 0.93 },
    'Gurugram': { 'Data Engineer': 0.88, 'Data Scientist': 0.93, 'AI Engineer': 0.88, 'Cloud Architect': 0.98, 'AI Ethics Specialist': 0.93, 'Software Engineer': 0.90, 'ML Engineer': 0.89, 'Full Stack Developer': 0.94, 'Java Developer': 0.92, 'Python Developer': 0.91 },
    'Noida': { 'Data Engineer': 0.95, 'Data Scientist': 1.0, 'AI Engineer': 0.95, 'Cloud Architect': 1.05, 'AI Ethics Specialist': 0.98, 'Software Engineer': 0.97, 'ML Engineer': 0.96, 'Full Stack Developer': 1.01, 'Java Developer': 0.99, 'Python Developer': 0.98 },
    'Kochi': { 'Data Engineer': 0.98, 'Data Scientist': 0.92, 'AI Engineer': 0.88, 'Cloud Architect': 0.92, 'AI Ethics Specialist': 0.85, 'Software Engineer': 1.0, 'ML Engineer': 0.90, 'Full Stack Developer': 0.96, 'Java Developer': 1.02, 'Python Developer': 0.91 },
    'Chandigarh': { 'Data Engineer': 1.02, 'Data Scientist': 0.97, 'AI Engineer': 0.95, 'Cloud Architect': 0.98, 'AI Ethics Specialist': 0.92, 'Software Engineer': 1.04, 'ML Engineer': 0.96, 'Full Stack Developer': 1.00, 'Java Developer': 1.06, 'Python Developer': 0.97 },
    'Ahmedabad': { 'Data Engineer': 0.82, 'Data Scientist': 0.78, 'AI Engineer': 0.73, 'Cloud Architect': 0.80, 'AI Ethics Specialist': 0.70, 'Software Engineer': 0.84, 'ML Engineer': 0.75, 'Full Stack Developer': 0.80, 'Java Developer': 0.86, 'Python Developer': 0.76 },
    'Indore': { 'Data Engineer': 0.80, 'Data Scientist': 0.75, 'AI Engineer': 0.70, 'Cloud Architect': 0.78, 'AI Ethics Specialist': 0.68, 'Software Engineer': 0.82, 'ML Engineer': 0.72, 'Full Stack Developer': 0.78, 'Java Developer': 0.84, 'Python Developer': 0.73 },
    'Jaipur': { 'Data Engineer': 0.78, 'Data Scientist': 0.73, 'AI Engineer': 0.68, 'Cloud Architect': 0.75, 'AI Ethics Specialist': 0.65, 'Software Engineer': 0.80, 'ML Engineer': 0.70, 'Full Stack Developer': 0.76, 'Java Developer': 0.82, 'Python Developer': 0.71 },
    'Lucknow': { 'Data Engineer': 0.75, 'Data Scientist': 0.70, 'AI Engineer': 0.65, 'Cloud Architect': 0.72, 'AI Ethics Specialist': 0.62, 'Software Engineer': 0.77, 'ML Engineer': 0.67, 'Full Stack Developer': 0.73, 'Java Developer': 0.79, 'Python Developer': 0.68 },
    'Visakhapatnam': { 'Data Engineer': 0.85, 'Data Scientist': 0.80, 'AI Engineer': 0.75, 'Cloud Architect': 0.82, 'AI Ethics Specialist': 0.72, 'Software Engineer': 0.87, 'ML Engineer': 0.77, 'Full Stack Developer': 0.83, 'Java Developer': 0.89, 'Python Developer': 0.78 },
    'Surat': { 'Data Engineer': 0.83, 'Data Scientist': 0.78, 'AI Engineer': 0.73, 'Cloud Architect': 0.80, 'AI Ethics Specialist': 0.70, 'Software Engineer': 0.85, 'ML Engineer': 0.75, 'Full Stack Developer': 0.81, 'Java Developer': 0.87, 'Python Developer': 0.76 },
    'Vadodara': { 'Data Engineer': 0.81, 'Data Scientist': 0.76, 'AI Engineer': 0.71, 'Cloud Architect': 0.78, 'AI Ethics Specialist': 0.68, 'Software Engineer': 0.83, 'ML Engineer': 0.73, 'Full Stack Developer': 0.79, 'Java Developer': 0.85, 'Python Developer': 0.74 },
    'Nagpur': { 'Data Engineer': 0.79, 'Data Scientist': 0.74, 'AI Engineer': 0.69, 'Cloud Architect': 0.76, 'AI Ethics Specialist': 0.66, 'Software Engineer': 0.81, 'ML Engineer': 0.71, 'Full Stack Developer': 0.77, 'Java Developer': 0.83, 'Python Developer': 0.72 },
    'Ranchi': { 'Data Engineer': 0.77, 'Data Scientist': 0.72, 'AI Engineer': 0.67, 'Cloud Architect': 0.74, 'AI Ethics Specialist': 0.64, 'Software Engineer': 0.79, 'ML Engineer': 0.69, 'Full Stack Developer': 0.75, 'Java Developer': 0.81, 'Python Developer': 0.70 },
    'Thiruvananthapuram': { 'Data Engineer': 0.96, 'Data Scientist': 0.91, 'AI Engineer': 0.86, 'Cloud Architect': 0.90, 'AI Ethics Specialist': 0.83, 'Software Engineer': 0.98, 'ML Engineer': 0.88, 'Full Stack Developer': 0.94, 'Java Developer': 1.00, 'Python Developer': 0.89 },
    'Bhopal': { 'Data Engineer': 0.78, 'Data Scientist': 0.73, 'AI Engineer': 0.68, 'Cloud Architect': 0.75, 'AI Ethics Specialist': 0.65, 'Software Engineer': 0.80, 'ML Engineer': 0.70, 'Full Stack Developer': 0.76, 'Java Developer': 0.82, 'Python Developer': 0.71 },
    'Coimbatore': { 'Data Engineer': 0.90, 'Data Scientist': 0.85, 'AI Engineer': 0.80, 'Cloud Architect': 0.87, 'AI Ethics Specialist': 0.77, 'Software Engineer': 0.92, 'ML Engineer': 0.82, 'Full Stack Developer': 0.88, 'Java Developer': 0.94, 'Python Developer': 0.83 },
    'Nashik': { 'Data Engineer': 0.76, 'Data Scientist': 0.71, 'AI Engineer': 0.66, 'Cloud Architect': 0.73, 'AI Ethics Specialist': 0.63, 'Software Engineer': 0.78, 'ML Engineer': 0.68, 'Full Stack Developer': 0.74, 'Java Developer': 0.80, 'Python Developer': 0.69 },
    'Aurangabad': { 'Data Engineer': 0.74, 'Data Scientist': 0.69, 'AI Engineer': 0.64, 'Cloud Architect': 0.71, 'AI Ethics Specialist': 0.61, 'Software Engineer': 0.76, 'ML Engineer': 0.66, 'Full Stack Developer': 0.72, 'Java Developer': 0.78, 'Python Developer': 0.67 },
    'Amritsar': { 'Data Engineer': 0.80, 'Data Scientist': 0.75, 'AI Engineer': 0.70, 'Cloud Architect': 0.77, 'AI Ethics Specialist': 0.67, 'Software Engineer': 0.82, 'ML Engineer': 0.72, 'Full Stack Developer': 0.78, 'Java Developer': 0.84, 'Python Developer': 0.73 },
    'Ludhiana': { 'Data Engineer': 0.81, 'Data Scientist': 0.76, 'AI Engineer': 0.71, 'Cloud Architect': 0.78, 'AI Ethics Specialist': 0.68, 'Software Engineer': 0.83, 'ML Engineer': 0.73, 'Full Stack Developer': 0.79, 'Java Developer': 0.85, 'Python Developer': 0.74 },
    'Guwahati': { 'Data Engineer': 0.83, 'Data Scientist': 0.78, 'AI Engineer': 0.73, 'Cloud Architect': 0.80, 'AI Ethics Specialist': 0.70, 'Software Engineer': 0.85, 'ML Engineer': 0.75, 'Full Stack Developer': 0.81, 'Java Developer': 0.87, 'Python Developer': 0.76 },
    'Kolkata': { 'Data Engineer': 0.87, 'Data Scientist': 0.82, 'AI Engineer': 0.77, 'Cloud Architect': 0.84, 'AI Ethics Specialist': 0.74, 'Software Engineer': 0.89, 'ML Engineer': 0.79, 'Full Stack Developer': 0.85, 'Java Developer': 0.91, 'Python Developer': 0.80 },
};

// ── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter">{entry.name}:</span>
                        </div>
                        <span className="text-xs font-black text-white">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getSeverityStyle(severity) {
    if (severity === 'critical') return 'bg-red-500/10 border-red-500/20 text-red-400';
    if (severity === 'warning') return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
    return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
}

// ── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('All India');
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [selectedPeriod, setSelectedPeriod] = useState('6 Months');
    const [activeTab, setActiveTab] = useState('overview');
    const [timelineData, setTimelineData] = useState(null);

    // Period-derived base data
    const basePeriodStats = statsByPeriod[selectedPeriod];
    const periodSectorGrowth = sectorGrowthByPeriod[selectedPeriod];

    // City + period derived data
    const isAllIndia = selectedCity === 'All India';
    const cityMult = isAllIndia ? 1 : (cityStatMultiplier[selectedCity] || 0.1);

    const isAllRoles = selectedRole === 'All Roles';
    const roleMult = isAllRoles ? 1 : (roleStatMultiplier[selectedRole] || 0.15);

    const periodStats = {
        jobs: Math.round((data?.data_stats?.total_jobs || parseInt(basePeriodStats.jobs.replace(/,/g, ''))) * cityMult * roleMult).toLocaleString(),
        growth: data?.tab_a_hiring_trends?.role_trends?.[0]?.growth || basePeriodStats.growth,
        risk: Math.min(100, Math.round((data?.tab_c_vulnerability_index?.overall_risk || basePeriodStats.risk) * (selectedRole === 'All Roles' ? 1 : 1.2))),
        salary: data?.avg_salary ? `₹${data.avg_salary} LPA` : (data?.tab_c_vulnerability_index?.avg_salary ? `₹${data.tab_c_vulnerability_index.avg_salary} LPA` : basePeriodStats.salary),
        salSub: data?.top_role ? `Top: ${data.top_role}` : basePeriodStats.salSub,
    };

    const periodHiring = (() => {
        // Use real company data from API if available
        if (data?.company_data && data.company_data.length > 0) {
            return data.company_data;
        }
        // Fallback to mock data
        const baseCompanies = isAllIndia ? hiringByPeriod[selectedPeriod] : (cityHiringCompanies[selectedCity] || hiringByPeriod[selectedPeriod]);
        return baseCompanies.map(c => ({
            ...c,
            postings: Math.round(c.postings * (selectedPeriod === '7 Days' ? 0.13 : selectedPeriod === '1 Month' ? 0.48 : selectedPeriod === '1 Year' ? 2.2 : 1)),
        }));
    })();

    const periodRoleDemand = (() => {
        // Use real API data if available, otherwise fallback to mock
        if (data?.trends && data.trends.length > 0) {
            let filtered = data.trends;
            if (selectedRole !== 'All Roles') {
                filtered = filtered.filter(t => t.job_title === selectedRole);
            }
            return filtered.map(t => ({
                role: t.job_title,
                demand: t.demand_score,
                growth: `+${Math.round(t.demand_score * 0.5)}%`,
                automation_risk: t.ai_automation_signal
            })).slice(0, 5);
        }
        // Fallback to mock data
        let base = roleDemandByPeriod[selectedPeriod];
        if (selectedRole !== 'All Roles') {
            base = base.filter(r => r.role === selectedRole);
            if (base.length === 0) base = [{ role: selectedRole, demand: 75, growth: '+15%' }];
        }
        if (isAllIndia) return base;
        const mult = cityRoleDemandMultiplier[selectedCity] || {};
        return base.map(r => ({
            ...r,
            demand: Math.min(100, Math.round(r.demand * (mult[r.role] || 1))),
        }));
    })();

    const dynamicAlerts = data?.trends?.filter(t => t.ai_automation_signal > 60).map((t, i) => ({
        id: i,
        severity: t.ai_automation_signal > 80 ? 'critical' : 'warning',
        message: `${t.job_title} in ${t.city} showing high automation risk signals.`,
        icon: t.ai_automation_signal > 80 ? 'shield' : 'trending'
    })) || [];

    const [drillDownItem, setDrillDownItem] = useState(null);
    const [drillDownType, setDrillDownType] = useState('role');

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const cityParam = selectedCity === 'All India' ? '' : selectedCity;
                const roleParam = selectedRole === 'All Roles' ? '' : selectedRole;
                const responseData = await getDashboardData(cityParam, roleParam, selectedPeriod);

                // Synthesize dynamic mock data generator
                const generateMocks = () => {
                    const isAllIndia = selectedCity === 'All India';
                    const isAllRoles = selectedRole === 'All Roles';
                    const baseSal = parseFloat(basePeriodStats.salary.replace(/[^\d.]/g, '')) || 7.4;
                    const cityBonus = isAllIndia ? 0 : (selectedCity.length % 5) - 2;
                    const roleBonus = isAllRoles ? 0 : (selectedRole.length % 6) - 2.5;
                    const dynamicSalary = `${Math.max(3, baseSal + cityBonus + roleBonus).toFixed(1)}`;

                    const mockTrends = [
                        { city: 'Bangalore', job_title: 'Software Engineer', demand_score: 85, ai_automation_signal: 20 },
                        { city: 'Mumbai', job_title: 'Data Entry Clerk', demand_score: 30, ai_automation_signal: 95 },
                        { city: 'Delhi', job_title: 'Data Analyst', demand_score: 65, ai_automation_signal: 55 },
                        { city: 'Hyderabad', job_title: 'Cloud Architect', demand_score: 80, ai_automation_signal: 25 },
                        { city: 'Pune', job_title: 'Business Analyst', demand_score: 55, ai_automation_signal: 55 },
                        { city: 'Chennai', job_title: 'Data Scientist', demand_score: 78, ai_automation_signal: 25 }
                    ];

                    const cityFilteredTrends = isAllIndia ? mockTrends : mockTrends.map(t => ({ ...t, job_title: selectedRole }));
                    const safeHorizonRole = [...cityFilteredTrends].sort((a, b) => a.ai_automation_signal - b.ai_automation_signal)[0]?.job_title || 'Data Scientist';

                    return {
                        trends: cityFilteredTrends,
                        dynamicSalary,
                        safeHorizonRole,
                        mockTrends
                    };
                };

                const mocks = generateMocks();

                // Merge real data with mocks if real data is empty
                const mergedData = {
                    ...responseData,
                    data_stats: responseData.data_stats || {
                        total_jobs: Math.round(parseInt(basePeriodStats.jobs.replace(/,/g, '')) * cityMult * roleMult),
                        active_users: 12400,
                        skills_tracked: 450
                    },
                    trends: (responseData.trends && responseData.trends.length > 0) ? responseData.trends : mocks.trends,
                    hiring_chart_data: (responseData.hiring_chart_data && responseData.hiring_chart_data.length > 0) ? responseData.hiring_chart_data : (isAllIndia ? [
                        { label: 'Bangalore', openings: 5800 },
                        { label: 'Mumbai', openings: 4200 },
                        { label: 'Delhi', openings: 3200 },
                        { label: 'Hyderabad', openings: 3800 },
                    ] : mocks.trends.map(t => ({ label: t.city, openings: t.demand_score * 50 }))),
                    skills_demand: (responseData.skills_demand && responseData.skills_demand.length > 0) ? responseData.skills_demand : [
                        { skill: 'Python', demand: 85 }, { skill: 'SQL', demand: 75 }, { skill: 'React', demand: 80 }, { skill: 'AWS', demand: 65 }
                    ],
                    top_growing_roles: (responseData.top_growing_roles && responseData.top_growing_roles.length > 0) ? responseData.top_growing_roles : [
                        { role: selectedRole === 'All Roles' ? 'AI Engineer' : selectedRole, growth: 92 },
                        { role: 'Cloud Architect', growth: 85 }
                    ],
                    avg_salary: responseData.avg_salary || mocks.dynamicSalary,
                    top_safe_jobs: (responseData.top_safe_jobs && responseData.top_safe_jobs.length > 0) ? responseData.top_safe_jobs : [mocks.safeHorizonRole],

                    tab_a_hiring_trends: {
                        city_trends: (responseData.tab_a_hiring_trends?.city_trends?.length > 0) ? responseData.tab_a_hiring_trends.city_trends : mocks.mockTrends.slice(0, 5).map(t => ({ name: t.city, count: Math.round(t.demand_score * 40), growth: (t.demand_score % 15) - 5 })),
                        role_trends: (responseData.tab_a_hiring_trends?.role_trends?.length > 0) ? responseData.tab_a_hiring_trends.role_trends : [
                            { name: selectedRole === 'All Roles' ? 'Software Engineer' : selectedRole, count: 1240, growth: 12 },
                            { name: 'Data Analyst', count: 850, growth: 8 }
                        ],
                        sector_trends: (responseData.tab_a_hiring_trends?.sector_trends?.length > 0) ? responseData.tab_a_hiring_trends.sector_trends : [
                            { name: 'Technology', growth: 14 }, { name: 'Finance', growth: -2 }, { name: 'Healthcare', growth: 9 }
                        ]
                    },
                    tab_b_skills_intelligence: {
                        rising_skills: (responseData.tab_b_skills_intelligence?.rising_skills?.length > 0) ? responseData.tab_b_skills_intelligence.rising_skills : [
                            { skill: 'Generative AI', trend: '+142%', openings: 1200 }, { skill: 'PyTorch', trend: '+85%', openings: 850 }
                        ],
                        declining_skills: (responseData.tab_b_skills_intelligence?.declining_skills?.length > 0) ? responseData.tab_b_skills_intelligence.declining_skills : [
                            { skill: 'Manual Testing', trend: '-30%', openings: 450 }
                        ],
                        skill_gap_map: (responseData.tab_b_skills_intelligence?.skill_gap_map?.length > 0) ? responseData.tab_b_skills_intelligence.skill_gap_map : [
                            { skill: 'Python', demand: 90, supply: 65 }, { skill: 'MLOps', demand: 75, supply: 30 }
                        ]
                    },
                    tab_c_vulnerability_index: {
                        role_vulnerability: (responseData.tab_c_vulnerability_index?.role_vulnerability?.length > 0) ? responseData.tab_c_vulnerability_index.role_vulnerability : mocks.mockTrends.slice(0, 6).map(t => ({
                            role: t.job_title, risk_score: t.ai_automation_signal, trend: 'Stable'
                        })),
                        city_vulnerability: (responseData.tab_c_vulnerability_index?.city_vulnerability?.length > 0) ? responseData.tab_c_vulnerability_index.city_vulnerability : mocks.mockTrends.slice(0, 4).map(t => ({
                            city: t.city, risk_score: Math.round(t.ai_automation_signal * 0.8), vulnerability: 'Moderate'
                        })),
                        industry_risk_matrix: (responseData.tab_c_vulnerability_index?.industry_risk_matrix?.length > 0)
                            ? responseData.tab_c_vulnerability_index.industry_risk_matrix.map(i => ({
                                sector: i.industry || i.sector,
                                risk_score: i.risk || i.risk_score,
                                vulnerability: i.impact || i.vulnerability
                            }))
                            : [
                                { sector: 'BPO/KPO', risk_score: 85, vulnerability: 'Critical' },
                                { sector: 'IT Services', risk_score: 45, vulnerability: 'Moderate' },
                                { sector: 'Finance', risk_score: 35, vulnerability: 'Low' },
                                { sector: 'Healthcare', risk_score: 15, vulnerability: 'Low' },
                                { sector: 'Manufacturing', risk_score: 65, vulnerability: 'High' }
                            ]
                    }
                };

                setData(mergedData);
            } catch {
                // Synthesize dynamic mock data based on selectedCity and selectedRole
                const roleKey = selectedRole.toLowerCase();
                const isAllIndia = selectedCity === 'All India';
                const isAllRoles = selectedRole === 'All Roles';

                // Dynamic salary calculation
                const baseSal = parseFloat(basePeriodStats.salary.replace(/[^\d.]/g, '')) || 7.4;
                const cityBonus = isAllIndia ? 0 : (selectedCity.length % 5) - 2;
                const roleBonus = isAllRoles ? 0 : (selectedRole.length % 6) - 2.5;
                const dynamicSalary = `${Math.max(3, baseSal + cityBonus + roleBonus).toFixed(1)}`;

                const mockTrends = [
                    { city: 'Bangalore', job_title: 'Software Engineer', demand_score: 85, ai_automation_signal: 20 },
                    { city: 'Mumbai', job_title: 'Data Entry Clerk', demand_score: 30, ai_automation_signal: 95 },
                    { city: 'Delhi', job_title: 'Data Analyst', demand_score: 65, ai_automation_signal: 55 },
                    { city: 'Hyderabad', job_title: 'Cloud Architect', demand_score: 80, ai_automation_signal: 25 },
                    { city: 'Pune', job_title: 'Business Analyst', demand_score: 55, ai_automation_signal: 55 },
                    { city: 'Chennai', job_title: 'Data Scientist', demand_score: 78, ai_automation_signal: 25 },
                    { city: 'Gurgaon', job_title: 'Data Engineer', demand_score: 82, ai_automation_signal: 18 },
                    { city: 'Noida', job_title: 'Full Stack Developer', demand_score: 75, ai_automation_signal: 22 },
                ];

                // Filter or synthesize role-specific data
                const filteredTrends = isAllRoles ? mockTrends : mockTrends.map(t => ({ ...t, job_title: selectedRole }));
                const cityFilteredTrends = isAllIndia ? filteredTrends : filteredTrends.filter(t => t.city === selectedCity);

                // If city filter returns nothing, create at least one entry for that city
                if (cityFilteredTrends.length === 0 && !isAllIndia) {
                    cityFilteredTrends.push({
                        city: selectedCity,
                        job_title: isAllRoles ? 'Software Engineer' : selectedRole,
                        demand_score: 70 + (selectedCity.length % 20),
                        ai_automation_signal: 30 + (selectedRole.length % 40)
                    });
                }

                const safeHorizonRole = (() => {
                    const sorted = [...cityFilteredTrends].sort((a, b) => a.ai_automation_signal - b.ai_automation_signal);
                    return sorted[0]?.job_title || 'Data Scientist';
                })();

                setData({
                    data_stats: {
                        total_jobs: Math.round(parseInt(basePeriodStats.jobs.replace(/,/g, '')) * cityMult * roleMult),
                        active_users: 12400,
                        skills_tracked: 450
                    },
                    trends: cityFilteredTrends,
                    hiring_chart_data: isAllIndia ? [
                        { label: 'Bangalore', openings: 5800 },
                        { label: 'Mumbai', openings: 4200 },
                        { label: 'Delhi', openings: 3200 },
                        { label: 'Hyderabad', openings: 3800 },
                    ] : cityFilteredTrends.map(t => ({ label: t.city, openings: t.demand_score * 50 })),
                    hiring_chart_label: "Hiring by City",
                    available_cities: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon', 'Gurugram', 'Noida', 'Kochi', 'Chandigarh', 'Ahmedabad', 'Indore', 'Jaipur', 'Lucknow', 'Visakhapatnam', 'Surat', 'Vadodara', 'Nagpur', 'Ranchi', 'Thiruvananthapuram', 'Bhopal', 'Coimbatore', 'Kolkata', 'Nashik', 'Aurangabad', 'Amritsar', 'Ludhiana', 'Guwahati'],
                    available_roles: ['Software Engineer', 'Data Analyst', 'Cloud Architect', 'Data Scientist', 'Data Engineer', 'AI Engineer', 'ML Engineer', 'Full Stack Developer', 'Java Developer', 'Python Developer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'QA Engineer', 'Business Analyst', 'Product Manager', 'UI/UX Designer', 'Mobile Developer', 'Security Engineer', 'Solutions Architect', 'Tech Lead', 'Database Administrator', 'Business Intelligence Analyst', 'Blockchain Developer', 'AI Ethics Specialist'],
                    data_stats: { total_jobs: Math.round(15036 * (isAllRoles ? 1 : 0.5)) },
                    top_safe_jobs: [safeHorizonRole],
                    avg_salary: dynamicSalary,
                    top_trending_skills: ['Python', 'SQL', 'React', 'Cloud'],
                    skills_demand: [
                        { skill: 'Python', demand: 85 }, { skill: 'SQL', demand: 75 }, { skill: 'React', demand: 80 },
                        { skill: 'AWS', demand: 65 }, { skill: 'Docker', demand: 55 }
                    ],
                    top_growing_roles: [
                        { role: isAllRoles ? 'AI Engineer' : selectedRole, growth: 92 },
                        { role: 'Cloud Architect', growth: 85 },
                    ],
                    recommended_courses: [],

                    // --- TAB DATA (Missing previously) ---
                    tab_a_hiring_trends: {
                        city_trends: mockTrends.slice(0, 5).map(t => ({ name: t.city, count: Math.round(t.demand_score * 40), growth: (t.demand_score % 15) - 5 })),
                        role_trends: [
                            { name: isAllRoles ? 'Software Engineer' : selectedRole, count: 1240, growth: 12 },
                            { name: 'Data Analyst', count: 850, growth: 8 },
                            { name: 'Cloud Architect', count: 560, growth: 15 }
                        ],
                        sector_trends: [
                            { name: 'Technology', growth: 14 },
                            { name: 'Finance', growth: -2 },
                            { name: 'Healthcare', growth: 9 }
                        ]
                    },
                    tab_b_skills_intelligence: {
                        rising_skills: [
                            { skill: 'Generative AI', trend: '+142%', openings: 1200 },
                            { skill: 'PyTorch', trend: '+85%', openings: 850 },
                            { skill: 'TypeScript', trend: '+45%', openings: 3200 }
                        ],
                        declining_skills: [
                            { skill: 'Manual Testing', trend: '-30%', openings: 450 },
                            { skill: 'Legacy SQL', trend: '-15%', openings: 800 }
                        ],
                        skill_gap_map: [
                            { skill: 'Python', demand: 90, supply: 65 },
                            { skill: 'MLOps', demand: 75, supply: 30 },
                            { skill: 'Cloud Security', demand: 80, supply: 45 }
                        ]
                    },
                    tab_c_vulnerability_index: {
                        role_vulnerability: mockTrends.slice(0, 6).map(t => ({
                            role: t.job_title,
                            risk_score: t.ai_automation_signal,
                            trend: t.ai_automation_signal > 60 ? 'Rising' : 'Stable'
                        })),
                        city_vulnerability: mockTrends.slice(0, 4).map(t => ({
                            city: t.city,
                            risk_score: Math.round(t.ai_automation_signal * 0.8),
                            vulnerability: t.ai_automation_signal > 60 ? 'High' : 'Moderate'
                        })),
                        industry_risk_matrix: [
                            { sector: 'BPO/KPO', risk_score: 85, vulnerability: 'Critical' },
                            { sector: 'IT Services', risk_score: 45, vulnerability: 'High' },
                            { sector: 'R&D / Science', risk_score: 15, vulnerability: 'Low' }
                        ]
                    }
                });
            }
        }
        loadData();
    }, [selectedCity, selectedRole, selectedPeriod]);

    // Load timeline data for reskilling
    useEffect(() => {
        async function loadTimeline() {
            try {
                const cityParam = selectedCity === 'All India' ? 'All India' : selectedCity;
                const roleParam = selectedRole === 'All Roles' ? 'Data Scientist' : selectedRole;
                const timeline = await getReskillingTimeline(cityParam, roleParam);
                setTimelineData(timeline);
            } catch (error) {
                console.warn("Timeline load failed, using defaults");
            }
        }
        loadTimeline();
    }, [selectedCity, selectedRole]);

    const handleDrillDown = (item, type = 'role') => { setDrillDownItem(item); setDrillDownType(type); };

    if (loading && !data) return <div className="p-8 flex justify-center items-center h-full min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 shadow-[0_0_15px_#7b2cbf]"></div></div>;

    const availableCities = data?.available_cities || [];
    const availableRoles = data?.available_roles || [];
    const currentCityMetrics = cityMetrics[selectedCity] || null;

    return (
        <div className="animate-in fade-in zoom-in-95 duration-700 relative min-h-screen pb-20">

            {drillDownItem && (
                <DrillDownPanel item={drillDownItem} type={drillDownType} onClose={() => setDrillDownItem(null)} />
            )}

            <div className="space-y-10">
                {/* SVG Chart Gradients */}
                <svg width="0" height="0" className="absolute">
                    <defs>
                        <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7b2cbf" stopOpacity={1} />
                            <stop offset="100%" stopColor="#5a189a" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f72585" stopOpacity={1} />
                            <stop offset="100%" stopColor="#b5179e" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7b2cbf" stopOpacity={1} />
                            <stop offset="100%" stopColor="#3c096c" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="companyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4cc9f0" stopOpacity={1} />
                            <stop offset="100%" stopColor="#4361ee" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="roleGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#7b2cbf" stopOpacity={1} />
                            <stop offset="100%" stopColor="#f72585" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4cc9f0" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#4cc9f0" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                </svg>

                {/* ── HEADER + LIVE STATUS ─────────────────────────────── */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                            COMMAND CENTER
                            {loading && <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>}
                        </h2>
                        <p className="text-slate-400 mt-2 font-medium tracking-wide uppercase text-xs">AI Workforce Signal Extraction Active</p>

                        <div className="mt-6 flex flex-wrap items-center gap-4">
                            {/* City Selector */}
                            <div className="flex items-center gap-3 bg-slate-900/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-2xl shadow-xl w-fit hover:border-primary-500/50 transition-all group">
                                <MapPin className="w-4 h-4 text-primary-400 neon-glow group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Region:</span>
                                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[var(--text-color)] cursor-pointer outline-none">
                                    <option value="All India" className="bg-[var(--bg-color)] text-[var(--text-color)]">All India</option>
                                    {availableCities.map(city => <option key={city} value={city} className="bg-[var(--bg-color)] text-[var(--text-color)]">{city}</option>)}
                                </select>
                            </div>
                            {/* Role Selector */}
                            <div className="flex items-center gap-3 bg-slate-900/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-2xl shadow-xl w-fit hover:border-secondary-500/50 transition-all group">
                                <Briefcase className="w-4 h-4 text-secondary-400 neon-glow group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Role:</span>
                                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[var(--text-color)] cursor-pointer outline-none">
                                    <option value="All Roles" className="bg-[var(--bg-color)] text-[var(--text-color)]">All Roles</option>
                                    {availableRoles.map(role => <option key={role} value={role} className="bg-[var(--bg-color)] text-[var(--text-color)]">{role}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Time Period Selector */}
                        <div className="mt-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-cyan-400" />
                            <div className="flex bg-slate-900/5 border border-white/10 rounded-2xl p-1">
                                {TIME_PERIODS.map(period => (
                                    <button
                                        key={period}
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedPeriod === period
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-900/10'
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Live Status */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/analytics"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-4 rounded-3xl shadow-xl shadow-primary-600/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group"
                        >
                            <BarChart3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Neural Analytics</span>
                        </Link>

                        <div className="bg-slate-900/5 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-6 shrink-0 neon-border hover:bg-slate-900/10 transition-all cursor-crosshair">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-[var(--text-color)] uppercase tracking-[0.2em]">Neural Link Live</span>
                            </div>
                            <span className="hidden sm:block w-px h-6 bg-slate-900/10"></span>
                            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                <Clock className="w-3.5 h-3.5 text-primary-400" /> Latency: 42ms
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── STATS OVERVIEW (Feature 8: Command Center) ──────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                        { label: 'Live Openings', value: periodStats.jobs, icon: Briefcase, color: 'primary' },
                        { label: 'Risk Level', value: periodStats.risk, icon: AlertTriangle, color: 'red', sub: 'Critical Found', animate: true },
                        { label: 'Avg Growth', value: periodStats.growth, icon: TrendingUp, color: 'cyan' },
                        { label: 'Safe Horizon', value: data?.top_safe_jobs?.[0] || 'Data Scientist', icon: ShieldAlert, color: 'green', small: true },
                        { label: 'Avg Salary', value: periodStats.salary, icon: IndianRupee, color: 'yellow', sub: periodStats.salSub },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-6 group relative overflow-hidden cursor-pointer hover:neon-border">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-500 group-hover:-translate-y-2">
                                <stat.icon className="w-16 h-16" />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 border border-${stat.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">{stat.label}</p>
                                    <h3 className={`${stat.small ? 'text-sm' : 'text-2xl'} font-bold mt-1 leading-none tracking-tight`}>{stat.value}</h3>
                                    {stat.sub && <p className={`text-[9px] text-${stat.color}-500 font-bold mt-1 tracking-widest uppercase ${stat.animate ? 'animate-pulse' : ''}`}>{stat.sub}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── TAB NAVIGATION ──────────────────────────────────────── */}
                <div className="flex gap-4 pb-8 border-b border-white/10">
                    {[
                        { id: 'overview', label: 'COMMAND CENTER', icon: Zap },
                        { id: 'hiring', label: 'TAB A: HIRING TRENDS', icon: TrendingUp },
                        { id: 'skills', label: 'TAB B: SKILLS INTELLIGENCE', icon: Database },
                        { id: 'vulnerability', label: 'TAB C: AI VULNERABILITY', icon: AlertTriangle }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                : 'bg-slate-900/5 text-slate-400 hover:text-white hover:bg-slate-900/10 border border-white/10'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── TAB CONTENT CONTAINER ──────────────────────────────── */}
                {activeTab === 'overview' && (
                    <>

                        {/* ── COURSE RECOMMENDATIONS SECTION ─────────────────────── */}
                        {data?.recommended_courses && data.recommended_courses.length > 0 && (
                            <div className="glass-card p-10">
                                <h3 className="text-lg font-black text-white tracking-widest uppercase mb-8 neon-glow">Recommended Reskilling Courses</h3>
                                <p className="text-[11px] text-slate-400 mb-8 tracking-wider">Top courses based on {data.filtered_city === 'All India' ? 'national' : data.filtered_city} hiring trends</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data.recommended_courses.map((course, idx) => (
                                        <div key={idx} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/5 p-6 hover:border-primary-500/50 hover:bg-slate-900/10 transition-all hover:shadow-[0_0_20px_#7b2cbf]/50">
                                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                                                <Database className="w-8 h-8" />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">{course.platform}</p>
                                                <h4 className="text-sm font-black text-white mb-3 leading-tight group-hover:text-primary-400 transition-colors">{course.course_name}</h4>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg border border-primary-500/30">{course.skill}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                                    <span>⏱ {course.duration}</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-yellow-400">★</span>
                                                        <span>{course.relevance_score}%</span>
                                                    </div>
                                                </div>
                                                <p className="text-[9px] text-slate-500 mt-3 pt-3 border-t border-white/10">{course.city_specific}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── CITY FILTER METRICS (Feature 3) ─────────────────── */}

                        {selectedCity === 'All India' ? (
                            <div className="glass-card p-6 flex items-center gap-6">
                                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">Aggregated View</p>
                                    <h3 className="text-xl font-black text-white">Cities Covered: <span className="text-cyan-400">42</span></h3>
                                </div>
                                <div className="ml-auto flex items-center gap-8">
                                    <div className="text-center"><p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Avg Hiring Velocity</p><p className="text-lg font-black text-white">+14.1%</p></div>
                                    <div className="text-center"><p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Avg Talent Density</p><p className="text-lg font-black text-white">87.6</p></div>
                                    <div className="text-center"><p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Market Score</p><p className="text-lg font-black text-white">82</p></div>
                                </div>
                            </div>
                        ) : currentCityMetrics && (
                            <div className="glass-card p-6 flex items-center gap-6">
                                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">City Intelligence</p>
                                    <h3 className="text-xl font-black text-white uppercase">{selectedCity}</h3>
                                </div>
                                <div className="ml-auto flex items-center gap-8">
                                    <div className="text-center"><p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Hiring Velocity</p><p className="text-lg font-black text-green-400">{currentCityMetrics.hiringVelocity}</p></div>
                                    <div className="text-center"><p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Talent Density</p><p className="text-lg font-black text-white">{currentCityMetrics.talentDensity}</p></div>
                                    <div className="text-center"><p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Market Score</p><p className="text-lg font-black text-cyan-400">{currentCityMetrics.marketScore}</p></div>
                                </div>
                            </div>
                        )}

                        {/* ── VULNERABILITY CLUSTERS ─────────────────── */}
                        <div className="grid grid-cols-1 gap-8">

                            <div className="glass-card p-10 flex flex-col">
                                <h3 className="text-sm font-black text-white tracking-widest uppercase mb-8 neon-glow">Vulnerability Clusters</h3>
                                <div className="flex-1 space-y-4">
                                    {(data?.trends || []).filter(t => isAllIndia || t.city === selectedCity).slice().sort((a, b) => b.ai_automation_signal - a.ai_automation_signal).slice(0, 7).map((trend, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/5 border border-white/5 hover:border-white/20 hover:bg-slate-900/10 transition-all group/item">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl transition-transform group-hover/item:scale-110 ${trend.ai_automation_signal > 70 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-white tracking-wide group-hover/item:text-primary-400 transition-colors uppercase">{trend.city}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{trend.job_title}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs font-black neon-glow ${trend.ai_automation_signal > 70 ? 'text-red-400' : 'text-yellow-400'}`}>{trend.ai_automation_signal}%</span>
                                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-0.5">Risk</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── COMPANY HIRING & ROLE DEMAND (Feature 1) ────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Hiring Companies */}
                            <div className="glass-card p-10 relative group">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-cyan-400" />
                                        <h3 className="text-sm font-black text-white tracking-widest uppercase neon-glow">Top Hiring Companies</h3>
                                    </div>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={periodHiring} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                                            <XAxis dataKey="company" axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', fontSize: 10, fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', fontSize: 10 }} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                            <Bar dataKey="postings" name="Job Postings" fill="url(#companyGradient)" radius={[4, 4, 0, 0]} barSize={28} onClick={(d) => handleDrillDown(d.company, 'company')} className="cursor-pointer" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Role Demand */}
                            <div className="glass-card p-10 relative group">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-purple-400" />
                                        <h3 className="text-sm font-black text-white tracking-widest uppercase neon-glow">Role Demand Index</h3>
                                    </div>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={periodRoleDemand} layout="vertical" margin={{ top: 10, right: 60, left: 30, bottom: 10 }} barCategoryGap={30}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', fontSize: 10 }} domain={[0, 100]} />
                                            <YAxis type="category" dataKey="role" axisLine={false} tickLine={false} tick={{ fill: "var(--chart-text)", fontSize: 10, fontWeight: 700 }} width={100} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                            <Bar dataKey="demand" name="Demand Score" fill="url(#roleGradient)" radius={[0, 4, 4, 0]} barSize={18} onClick={(d) => handleDrillDown(d.role, 'role')} className="cursor-pointer">
                                                <LabelList dataKey="growth" position="right" formatter={(v) => v} style={{ fill: '#4ade80', fontSize: 10, fontWeight: 900 }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* ── ATTRITION & EXPANSION VECTORS ───────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Automation Risk vs Market Demand */}
                            <div className="glass-card p-10 relative group">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xs font-bold tracking-widest uppercase">Attrition & Demand Index</h3>
                                    <Activity className="w-4 h-4 text-slate-200 opacity-20" />
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={(data?.trends || [])?.filter(t => isAllIndia || t.city === selectedCity)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                                            <XAxis dataKey="job_title" axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', fontSize: 10, fontWeight: 700 }} tickFormatter={(val) => val.length > 12 ? `${val.substring(0, 10)}...` : val} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', fontSize: 11 }} />
                                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }} />
                                            <Bar dataKey="demand_score" name="Market Force" fill="url(#primaryGradient)" radius={[4, 4, 0, 0]} barSize={20} onClick={(d) => handleDrillDown(d.job_title, 'role')} className="cursor-pointer" />
                                            <Bar dataKey="ai_automation_signal" name="AI Attrition" fill="url(#dangerGradient)" radius={[4, 4, 0, 0]} barSize={20} onClick={(d) => handleDrillDown(d.job_title, 'role')} className="cursor-pointer" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Expansion Vectors (Feature 7: Clickable sectors) */}
                            <div className="glass-card p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xs font-bold tracking-widest uppercase">Expansion Vectors</h3>
                                    <TrendingUp className="w-4 h-4 text-slate-200 opacity-20" />
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={periodSectorGrowth}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', fontSize: 10, fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', fontSize: 10, fontWeight: 700 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold' }} onClick={(e) => handleDrillDown(e.value, 'sector')} />
                                            {Object.entries(SECTOR_COLORS).map(([key, color]) => (
                                                <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, stroke: '#000', strokeWidth: 2, cursor: 'pointer', onClick: () => handleDrillDown(key, 'sector') }} />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* ── YEAR-WISE JOB DEMAND TREND (Feature 4) ──────────── */}
                        <div className="glass-card p-10">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-xs font-bold tracking-widest uppercase">Market Growth Trajectory</h3>
                                </div>
                                <Database className="w-4 h-4 text-slate-200 opacity-20" />
                            </div>
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={yearwiseTrend} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', fontSize: 11, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold' }} />
                                        {Object.entries(SECTOR_COLORS).map(([key, color]) => (
                                            <Line key={key} type="monotone" dataKey={key} name={key} stroke={color} strokeWidth={3} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 7, stroke: '#000', strokeWidth: 2 }} />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* ── SKILLS & ROLE LEADERBOARD ───────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Skill Acquisition Force */}
                            <div className="glass-card p-10">
                                <h3 className="text-xs font-bold tracking-widest uppercase mb-8">Skill Acquisition Force</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data?.skills_demand || []} margin={{ bottom: 40, top: 10, left: 0, right: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                                            <XAxis dataKey="skill" axisLine={false} tickLine={false} interval={0}
                                                tick={{ fill: 'var(--chart-text)', fontSize: 9, fontWeight: 700, angle: -40, textAnchor: 'end', dy: 10 }}
                                                tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 12)}...` : val}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                                            <Bar dataKey="demand" name="Demand Force" fill="url(#purpleGradient)" radius={[4, 4, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Growing Roles - Top Deployment Roles */}
                            <div className="glass-card p-10">
                                <h3 className="text-xs font-bold tracking-widest uppercase mb-8">Neural Expansion Trajectories</h3>
                                <div className="space-y-6">
                                    {data?.top_growing_roles?.map((item) => (
                                        <div key={item.role} className="group cursor-pointer" onClick={() => handleDrillDown(item.role, 'role')}>
                                            <div className="flex items-center justify-between mb-2 px-1">
                                                <span className="text-xs font-bold tracking-wide uppercase group-hover:text-primary-400 transition-colors">{item.role}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">Accelerated</span>
                                                    <TrendingUp className="w-3 h-3 text-green-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-900/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                                                <div className="bg-gradient-to-r from-primary-500 to-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: `${item.growth}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── TAB A: HIRING TRENDS ─────────────────────────────── */}
                {activeTab === 'hiring' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* City Hiring Trends */}
                            <div className="glass-card p-10">
                                <h3 className="text-xs font-bold tracking-widest uppercase mb-8 flex items-center justify-between">
                                    Hiring by City
                                    <span className="text-[10px] opacity-40">{selectedPeriod}</span>
                                </h3>
                                <div className="space-y-4">
                                    {data?.tab_a_hiring_trends?.city_trends?.map((city, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/5 border border-white/5 hover:border-white/10 transition-all">
                                            <span className="text-xs font-bold uppercase">{city.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] opacity-50">{city.count} Jobs</span>
                                                <span className={`text-xs font-bold ${city.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {city.growth > 0 ? '+' : ''}{city.growth}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Role Hiring Trends */}
                            <div className="glass-card p-10">
                                <h3 className="text-xs font-bold tracking-widest uppercase mb-8 flex items-center justify-between">
                                    Hiring by Role
                                    <span className="text-[10px] opacity-40">{selectedPeriod}</span>
                                </h3>
                                <div className="space-y-4">
                                    {data?.tab_a_hiring_trends?.role_trends?.map((role, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/5 border border-white/5 hover:border-white/10 transition-all">
                                            <span className="text-xs font-bold uppercase truncate max-w-[150px]">{role.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] opacity-50">{role.count}</span>
                                                <span className={`text-xs font-bold ${role.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {role.growth > 0 ? '+' : ''}{role.growth}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sector Hiring Trends */}
                            <div className="glass-card p-10">
                                <h3 className="text-xs font-bold tracking-widest uppercase mb-8 flex items-center justify-between">
                                    Hiring by Sector
                                    <span className="text-[10px] opacity-40">{selectedPeriod}</span>
                                </h3>
                                <div className="space-y-4">
                                    {data?.tab_a_hiring_trends?.sector_trends?.map((sector, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/5 border border-white/5 hover:border-white/10 transition-all">
                                            <span className="text-xs font-bold uppercase truncate max-w-[150px]">{sector.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold ${sector.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {sector.growth > 0 ? '+' : ''}{sector.growth}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB B: SKILLS INTELLIGENCE ──────────────────────────── */}
                {activeTab === 'skills' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="glass-card p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xs font-bold tracking-widest uppercase">Skill Velocity Intelligence</h3>
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-2 text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-400/10 px-3 py-1 rounded-full">Rising</span>
                                        <span className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-400/10 px-3 py-1 rounded-full">Declining</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Rising */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mb-4">Top Growth Skills</h4>
                                        {data?.tab_b_skills_intelligence?.rising_skills?.map((skill, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/5 border border-white/5 hover:border-green-500/20 hover:bg-slate-900/10 transition-all">
                                                <span className="text-xs font-bold uppercase">{skill.skill}</span>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-green-400">{skill.trend}</p>
                                                    <p className="text-[9px] opacity-40 font-bold uppercase">{skill.openings} Openings</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Declining */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mb-4">Market Contraction</h4>
                                        {data?.tab_b_skills_intelligence?.declining_skills?.map((skill, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/5 border border-white/5 hover:border-red-500/20 hover:bg-slate-900/10 transition-all opacity-70 hover:opacity-100">
                                                <span className="text-xs font-bold uppercase">{skill.skill}</span>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-red-400">{skill.trend}</p>
                                                    <p className="text-[9px] opacity-40 font-bold uppercase">{skill.openings} Openings</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skill Gap Map */}
                        <div className="glass-card p-10">
                            <h3 className="text-xs font-bold tracking-widest uppercase mb-8">Skill Gap Map (Demand vs Supply)</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.tab_b_skills_intelligence?.skill_gap_map || []} margin={{ bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="skill" axisLine={false} tickLine={false} tick={{ fill: "var(--chart-text)", fontSize: 9, fontWeight: 700, angle: -40, textAnchor: 'end' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: '20px', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }} />
                                        <Bar dataKey="demand" name="% Employer Demand" fill="#7b2cbf" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="supply" name="% Training Supply" fill="#4ade80" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB C: AI VULNERABILITY INDEX ───────────────────────── */}
                {activeTab === 'vulnerability' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="glass-card p-10">
                                <h3 className="text-xs font-bold tracking-widest uppercase mb-8">AI Automation Risk by Role</h3>
                                <div className="space-y-4">
                                    {data?.tab_c_vulnerability_index?.role_vulnerability?.map((role, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/5 border border-white/5 hover:border-white/20 hover:bg-slate-900/10 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 group-hover:scale-110 transition-transform">
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-wide">{role.role}</h4>
                                                    <p className="text-[10px] opacity-40 font-bold uppercase">{role.trend} trend</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xl font-bold ${role.risk_score > 70 ? 'text-red-400' : role.risk_score > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                    {role.risk_score}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card p-10">
                                <h3 className="text-xs font-bold tracking-widest uppercase mb-8">City Vulnerability Index</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {data?.tab_c_vulnerability_index?.city_vulnerability?.map((city, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-slate-900/5 border border-white/10 hover:border-white/20 transition-all">
                                            <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-2">{city.city}</p>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-2xl font-bold ${city.risk_score > 60 ? 'text-red-400' : city.risk_score > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                    {city.risk_score}
                                                </span>
                                                <span className="text-[9px] font-bold opacity-40 uppercase border border-white/10 px-2 py-1 rounded bg-slate-900/5">{city.vulnerability}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card p-10 lg:col-span-2">
                                <h3 className="text-xs font-bold tracking-widest uppercase mb-8">Industry Risk Matrix</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {data?.tab_c_vulnerability_index?.industry_risk_matrix?.map((industry, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-slate-900/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
                                            <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-2">{industry.sector}</p>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xl font-bold ${industry.risk_score > 60 ? 'text-red-400' : industry.risk_score > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                    {industry.risk_score}%
                                                </span>
                                                <span className={`text-[9px] font-bold uppercase border border-white/10 px-2 py-1 rounded bg-slate-900/5 ${industry.risk_score > 60 ? 'text-red-400' : industry.risk_score > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                    {industry.vulnerability}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── DISPLACEMENT WARNING SIGNALS ─────────────────────── */}
                <div className="glass-card p-10 border-l-4 border-red-500 bg-red-500/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/20 rounded-2xl">
                                <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white tracking-widest uppercase italic">Displacement Early Warning</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Real-time risk signals for {selectedCity} • {selectedRole}</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-black bg-red-500/20 text-red-400 px-5 py-2.5 rounded-full uppercase tracking-[0.2em]">
                            {dynamicAlerts.length} Alerts Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dynamicAlerts.length > 0 ? dynamicAlerts.map((alert) => (
                            <div key={alert.id} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all hover:scale-[1.02] ${getSeverityStyle(alert.severity)}`}>
                                <div className={`p-3 rounded-xl ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                    {alert.icon === 'shield' ? <Activity className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-tight leading-relaxed">{alert.message}</p>
                                    <p className="text-[9px] opacity-50 font-black uppercase tracking-widest mt-1.5">{alert.severity} Risk Signal</p>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 p-10 text-center bg-slate-900/5 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">No significant displacement risks detected for current selection</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
