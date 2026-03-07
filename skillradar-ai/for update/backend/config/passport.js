import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '../models/user.model.js';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret',
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        provider: 'google',
                        providerId: profile.id,
                    });
                    await user.save();
                }
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID || 'your_github_client_id',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your_github_client_secret',
            callbackURL: '/auth/github/callback',
            scope: ['user:email', 'read:user', 'repo'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.username}@github.com`;
                let user = await User.findOne({ email });

                if (!user) {
                    user = new User({
                        name: profile.displayName || profile.username,
                        email: email,
                        provider: 'github',
                        providerId: profile.id,
                    });
                    await user.save();
                }
                // attach accessToken so we can fetch repos later
                user.githubAccessToken = accessToken;
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
