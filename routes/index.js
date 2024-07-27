const express = require('express');
const authController = require('../controllers/authControllers');

module.exports = (supabase) => {
  const router = express.Router();
  router.use('/register', authController(supabase));
  return router;
};
