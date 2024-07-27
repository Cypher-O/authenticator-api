// //authController.js
// const express = require('express');
// const router = express.Router();
// const { generateToken } = require('../utils/authUtils');

// module.exports = (supabase) => {
//   router.post('/', async (req, res) => {
//     const { customer_name, username, password, image } = req.body;

//     // Input validation
//     if (!customer_name || !username || !password || !image) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     try {
//       const { data, error } = await supabase
//         .from('users')
//         .insert([{ customer_name, username, password, image }]);

//       if (error) {
//         if (error.code === '23505') {
//           return res.status(400).json({ message: 'Username already exists' });
//         }
//         throw error;
//       }

//       // Generate a token for the newly registered user
//       const userId = data[0].id; // Assume the ID is in the returned data
//       const token = generateToken(userId);

//       res.status(201).json({
//         message: 'User registered successfully',
//         data,
//         token // Include the token in the response
//       });
//     } catch (error) {
//       res.status(500).json({ message: 'Server error', error });
//     }
//   });

//   return router;
// };


// controllers/authController.js
const express = require('express');
const router = express.Router();
const { generateToken } = require('../utils/authUtils');

module.exports = (supabase) => {
  router.post('/', async (req, res) => {
    const { customer_name, username, password, image } = req.body;

    // Input validation
    if (!customer_name || !username || !password || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ customer_name, username, password, image }]);

      if (error) {
        console.error('Supabase error:', error); // Log the Supabase error
        if (error.code === '23505') {
          return res.status(400).json({ message: 'Username already exists' });
        }
        throw error;
      }

      // Generate a token for the newly registered user
      const userId = data[0].id; // Assume the ID is in the returned data
      const token = generateToken(userId);

      res.status(201).json({
        message: 'User registered successfully',
        data,
        token // Include the token in the response
      });
    } catch (error) {
      console.error('Server error:', error); // Log the server error
      res.status(500).json({ message: 'Server error', error });
    }
  });

  return router;
};
