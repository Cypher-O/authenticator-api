// const express = require('express');
// const bodyParser = require('body-parser');
// require('dotenv').config();
// var cors = require('cors');
// const authRoutes = require('./routes/authRoutes');
// const errorHandler = require('./middleware/errorHandler');
// const notFound = require('./middleware/notFound');
// const loggingMiddleware = require('./middleware/loggingMiddleware');

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(cors())

// app.use(express.static('public'));

// // Routes
// app.use(bodyParser.json());
// app.use('/api/auth', authRoutes);

// // Error handling middleware
// app.use(notFound);
// app.use(errorHandler);
// app.use(loggingMiddleware);

// // Start server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
var cors = require('cors');
const { runMigrations } = require('node-pg-migrate');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const loggingMiddleware = require('./middleware/loggingMiddleware');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

// Run migrations before starting the server
const startServer = async () => {
  try {
    await runMigrations({
      databaseUrl: {
        host: process.env.SUPABASE_DB_HOST,
        port: process.env.SUPABASE_DB_PORT,
        database: process.env.SUPABASE_DB_NAME,
        user: process.env.SUPABASE_DB_USER,
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
      },
      direction: 'up',
      migrationsTable: 'pgmigrations',
      dir: 'migrations',
    });
    console.log('Migrations completed successfully');

    // Routes
    app.use('/api/auth', authRoutes);

    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);
    app.use(loggingMiddleware);

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
};

startServer();
