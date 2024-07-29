const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
var cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const loggingMiddleware = require('./middleware/loggingMiddleware');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())

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

app.use(express.static('public'));

// Routes
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);
app.use(loggingMiddleware);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
