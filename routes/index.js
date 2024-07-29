const express = require('express');
const { register, login, generateUser, verifyUser, generateOtp, verifyOtp } = require('../controllers/authController');

module.exports = (supabase) => {
  const router = express.Router();

  router.post('/register', register(supabase));
  router.post('/login', login(supabase));
  router.post('/generate-user', generateUser(supabase));
  router.post('/verify-user', verifyUser(supabase));
  router.post('/generate-otp', generateOtp(supabase));
  router.post('/verify-token', verifyOtp(supabase));
  return router;
};
