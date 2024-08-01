const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
var cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.static('public'));

// Load the YAML file
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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