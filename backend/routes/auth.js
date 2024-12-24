const express = require('express');
const {
    login, 
    register,
    verify,
    logout
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register );

router.post('/login', login);
router.post('/logout',logout)
router.get('/verify', verify)
module.exports = router;
