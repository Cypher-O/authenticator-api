const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));

// Routes
const authRoutes = require('./routes/index')(supabase);
app.use('/api', authRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
