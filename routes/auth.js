const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    console.log(email)
    console.log(password)
    console.log(confirmPassword)
    if (!email || !password || !confirmPassword) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ msg: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ email });
        console.log(existingUser)
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword)
        
        const newUser = new User({ email, password: hashedPassword });
        console.log(newUser)
        await newUser.save();
        
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        console.log(token)

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Please fill all fields' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
