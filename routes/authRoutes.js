//routes/index.js
const express = require('express')
const authController = require('../controllers/authController')
const supabase = require('../config/supabase')

const router = express.Router()

router.post('/register', authController.register(supabase))
router.post('/login', authController.login(supabase))
router.post('/generate-user', authController.generateUser(supabase))
router.post('/verify-user', authController.verifyUser(supabase))
router.post('/generate-otp', authController.generateOtp(supabase))
router.post('/verify-token', authController.verifyOtp(supabase))

module.exports = router
