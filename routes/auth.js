const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();
// get routes
router.get('/login', authController.getLoginIn);

router.get('/signup', authController.getSignUp);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

// post routes
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail(),
    body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .trim()

], authController.postLogin);

router.post("/logout", authController.postLogout);

router.post('/signup',
    [
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email")
            .custom((value, { req }) => {
                // if (value === "test@test.com") {
                //     throw new Error("This email address is forbidden.");
                // }
                // return true;
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject("Email already exists, please pick a different one.");
                    }
                });
            })
            .normalizeEmail(),
        body("password", "Please enter a password with at least 5 characters")
            .isLength({ min: 5 })
            .trim(),
        body("confirmPassword").custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords have to match!");
            }
            return true;
        }).trim()
    ],
    authController.postSignup);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

module.exports = router;