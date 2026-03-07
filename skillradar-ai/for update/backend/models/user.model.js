import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false }, // optional for OAuth
        provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
        providerId: { type: String },
        githubAccessToken: { type: String },
        skillsProfile: { type: Object } // To store AI analyzed skills
    },
    { timestamps: true }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to verify password match
userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
