
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ username, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
            user: { id: user.id }
        };

    jwt.sign(payload, config.jwtSecret, { expiresIn: 36000 }, (err, token) => {
        if (err) throw err;

        res.cookie('auth_token', token, {
            // httpOnly: true,                
            // secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict',            
        });
        res.status(201).json({ username, msg: 'Registration successful' });
    });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const payload = {
            user: {
                id: user.id
            }
        };

        
    jwt.sign(payload, config.jwtSecret, { expiresIn: 36000 }, (err, token) => {
        if (err) throw err;

        res.cookie('auth_token', token, {
            // httpOnly: true,                
            // secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict',            
        });
        res.status(201).json({ username, msg: 'login wassuccessful' });
    });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


module.exports = {
    register,
    login
};
