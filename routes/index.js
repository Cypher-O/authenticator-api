const express = require('express');
const { register, login, generateUser } = require('../controllers/authControllers');

module.exports = (supabase) => {
  const router = express.Router();

  router.post('/register', register(supabase));
  router.post('/login', login(supabase));
  router.post('/generate-user', generateUser(supabase));
  return router;
};
