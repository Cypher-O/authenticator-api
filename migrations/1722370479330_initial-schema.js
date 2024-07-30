const { PgLiteral } = require('node-pg-migrate');
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    // Check if 'users' table exists
    pgm.sql(`
      CREATE OR REPLACE FUNCTION create_users_if_not_exists() RETURNS void AS $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            customer_name VARCHAR(255) NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            image TEXT,
            generated_username TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);
    pgm.sql(`SELECT create_users_if_not_exists();`);
    pgm.sql(`DROP FUNCTION create_users_if_not_exists();`);
  
    // Check if 'generated_users' table exists
    pgm.sql(`
      CREATE OR REPLACE FUNCTION create_generated_users_if_not_exists() RETURNS void AS $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'generated_users') THEN
          CREATE TABLE generated_users (
            id SERIAL PRIMARY KEY,
            unique_id VARCHAR(255) UNIQUE NOT NULL,
            type VARCHAR(50) NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            otp VARCHAR(6),
            otp_expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);
    pgm.sql(`SELECT create_generated_users_if_not_exists();`);
    pgm.sql(`DROP FUNCTION create_generated_users_if_not_exists();`);
  };

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('generated_users', { ifExists: true });
    pgm.dropTable('users', { ifExists: true });
  };
