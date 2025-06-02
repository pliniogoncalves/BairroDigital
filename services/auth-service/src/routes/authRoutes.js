const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protectAuth } = require('../middleware/authMiddleware');

router.post('/register', authController.registerUser); 

router.post('/login', authController.loginUser);

router.put('/profile', protectAuth, authController.updateUserProfile);

module.exports = router;