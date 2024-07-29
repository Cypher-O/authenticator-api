## About NODE.js API

This project is created with Node.js, Express and postgres using supabase to make a Restful API.

### API Features

The application can create & login customers, generate & verify users, generate & verify otp .

### TABLES

# Create users table using this query in your SQL editor

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  generated_username TEXT
);

# Create generated users table using query in your SQL editor

CREATE TABLE IF NOT EXISTS public.generated_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id TEXT NOT NULL,
  type TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  otp TEXT NULL,
  otp_expires_at TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
