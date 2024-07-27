const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.SUPABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const createUsersTable = async () => {
  console.log('Starting database setup...');
  try {
    await client.connect();
    console.log('Connected to database successfully.');

    const result = await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        image TEXT NOT NULL
      );
    `);

    console.log('Users table created successfully:');
    console.log(result); // Log the result of the query
  } catch (err) {
    console.error('Error creating users table:');
    console.error(err); // Log the error with stack trace
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
};

createUsersTable();
