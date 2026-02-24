const express = require('express');
const { sign } = require('jsonwebtoken');
const { signup, login } = require('../controller/authcontroller');

const router = express.Router();

// User registration
router.post('/signup', signup);

// User login
router.post('/login', login);

module.exports = router;