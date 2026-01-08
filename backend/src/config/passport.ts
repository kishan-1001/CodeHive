import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { pool } from './db';
import bcrypt from 'bcrypt';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                const googleId = profile.id;
                const name = profile.displayName;
                const photo = profile.photos?.[0].value;

                if (!email) {
                    return done(new Error('No email found from Google profile'), undefined);
                }

                // Check if user exists
                const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

                if (existingUser.rows.length > 0) {
                    const user = existingUser.rows[0];

                    // If user exists but no provider_id (linked via email only), update it
                    if (!user.provider_id) {
                        const updatedUser = await pool.query(
                            'UPDATE users SET provider = $1, provider_id = $2, avatar_url = $3 WHERE id = $4 RETURNING *',
                            ['google', googleId, photo, user.id]
                        );
                        return done(null, updatedUser.rows[0]);
                    }

                    return done(null, user);
                }

                // Create new user
                const newUser = await pool.query(
                    'INSERT INTO users (name, email, password, provider, provider_id, avatar_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [name, email, null, 'google', googleId, photo]
                );

                return done(null, newUser.rows[0]);
            } catch (error) {
                return done(error as Error, undefined);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            callbackURL: process.env.GITHUB_CALLBACK_URL!,
            scope: ['user:email'],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
            try {
                const email = profile.emails?.[0].value;
                const githubId = profile.id;
                const name = profile.displayName || profile.username;
                const photo = profile.photos?.[0].value;

                if (!email) {
                    return done(new Error('No email found from GitHub profile'), undefined);
                }

                // Check if user exists
                const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

                if (existingUser.rows.length > 0) {
                    const user = existingUser.rows[0];

                    // If user exists but no provider_id (linked via email only), update it
                    if (!user.provider_id) {
                        const updatedUser = await pool.query(
                            'UPDATE users SET provider = $1, provider_id = $2, avatar_url = $3 WHERE id = $4 RETURNING *',
                            ['github', githubId, photo, user.id]
                        );
                        return done(null, updatedUser.rows[0]);
                    }

                    return done(null, user);
                }

                // Create new user
                const newUser = await pool.query(
                    'INSERT INTO users (name, email, password, provider, provider_id, avatar_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [name, email, null, 'github', githubId, photo]
                );

                return done(null, newUser.rows[0]);
            } catch (error) {
                return done(error as Error, undefined);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, user.rows[0]);
    } catch (error) {
        done(error, null);
    }
});
