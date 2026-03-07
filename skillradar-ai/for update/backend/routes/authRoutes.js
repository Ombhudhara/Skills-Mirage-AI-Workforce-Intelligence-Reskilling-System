import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import axios from 'axios';

const router = express.Router();

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
    );
};

// ========================
// GOOGLE OAUTH
// ========================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=oauth_failed', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.redirect(`http://localhost:5173/oauth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    }
);

// ========================
// GITHUB OAUTH
// ========================
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'read:user', 'repo'] }));

router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: 'http://localhost:5173/login?error=oauth_failed', session: false }),
    async (req, res) => {
        try {
            const user = req.user;

            // Analyze GitHub Repositories for AI Skill Dashboard
            if (user.githubAccessToken) {
                // Fetch user's repos
                const response = await axios.get('https://api.github.com/user/repos?per_page=100', {
                    headers: { Authorization: `Bearer ${user.githubAccessToken}` }
                });

                const repos = response.data;
                const languageCounts = {};
                let totalStars = 0;

                repos.forEach(repo => {
                    totalStars += repo.stargazers_count;
                    if (repo.language) {
                        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
                    }
                });

                // Simple "AI-based" skill profile derivation
                user.skillsProfile = {
                    languages: languageCounts,
                    totalRepos: repos.length,
                    totalStars: totalStars,
                    topLanguage: Object.keys(languageCounts).sort((a, b) => languageCounts[b] - languageCounts[a])[0] || 'None'
                };

                // Clear the access token so we don't store it forever unnecessarily, or keep it depending on needs
                user.githubAccessToken = undefined;
                await user.save();
            }

            const token = generateToken(user);
            res.redirect(`http://localhost:5173/oauth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
        } catch (error) {
            console.error('Github auth processing error:', error);
            res.redirect('http://localhost:5173/login?error=github_processing_failed');
        }
    }
);

export default router;
