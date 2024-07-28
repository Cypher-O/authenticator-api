const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const initializeDatabase = require('./setupDatabase');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
// console.log(supabase);

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));

// app.get('/test-db', async (req, res) => {
//   try {
//     const { data, error } = await supabase.from('users').select('*');
//     if (error) {
//       return res.status(500).json({ message: 'Error fetching data from Supabase', error });
//     }
//     res.status(200).json({ message: 'Data fetched successfully', data });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// });

// Routes
const authRoutes = require('./routes/index')(supabase);
app.use('/api', authRoutes);

// // Initialize the database schema
// initializeDatabase(supabase)
//   .then(() => {
//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('Failed to initialize the database:', error);
//   });


// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
