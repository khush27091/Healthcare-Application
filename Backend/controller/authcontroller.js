const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');
const jwt = require("jsonwebtoken");    
const { sign } = require('jsonwebtoken');

// User registration
const signup = async (req, res) => {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password || !role)
        return res.status(400).json({ message: 'All fields required' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('users')
            .insert([{ full_name, email, password_hash: hashedPassword, role }])
            .select()
            .single();

        if (error) {
            console.error('Error inserting user:', error);
            return res.status(500).json({ message: 'Error creating user' });
        }

        return res.status(200).json({ message: 'User created successfully', data });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Error creating user' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // ✅ Include role in token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // ✅ Return clean user object (never send password_hash)
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "Error logging in" });
    }
};

module.exports = { signup, login };