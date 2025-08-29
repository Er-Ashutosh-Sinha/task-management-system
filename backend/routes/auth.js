const express = require('express');
const router = express.Router();
const { registerValidation, loginValidation } = require('../middleware/validation');
const { register, login, logout } = require('../controllers/authController');

router.route('/register').post(registerValidation, register);
router.route('/login').post(loginValidation, login);
router.route('/logout').post(logout);

module.exports = router;