import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import chatbotRoutes from './routes/chatbotRoutes.js';
import { User } from "./models/user.model.js";

const app = express();

// Middlewares
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(session({
    secret: process.env.JWT_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use("/auth", authRoutes); // OAuth Routes
app.use("/api/chatbot", chatbotRoutes); // Mount the route

// Normally routes go in a separate "routes" folder, but we keep them here for now

// Register Endpoint
// Expected by frontend at: /api/auth/register
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ detail: "Email already registered" });
        }

        const newUser = new User({
            name,
            email,
            password, // Mongoose hook automatically secures/hashes this before saving it
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ detail: "Registration failed. Please try again." });
    }
});

// Login Endpoint
// Expected by frontend at: /api/auth/login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ detail: "Invalid email or password" });
        }

        const isMatch = await user.isPasswordCorrect(password);
        if (!isMatch) {
            return res.status(401).json({ detail: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ detail: "Login failed. Check your credentials." });
    }
});

export { app };
