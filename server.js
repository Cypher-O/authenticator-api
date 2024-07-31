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