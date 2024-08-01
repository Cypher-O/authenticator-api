const { PgLiteral } = require('node-pg-migrate');

/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Create 'users' table
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: new PgLiteral('gen_random_uuid()'),
      notNull: true
    },
    customer_name: { type: 'varchar(255)', notNull: true },
    username: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    image: { type: 'text' },
    generated_username: { type: 'text' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  }, {
    ifNotExists: true
  });

  // Create 'generated_users' table
  pgm.createTable('generated_users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: new PgLiteral('gen_random_uuid()'),
      notNull: true
    },
    unique_id: { type: 'varchar(255)', notNull: true, unique: true },
    type: { type: 'varchar(50)', notNull: true },
    username: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    otp: { type: 'varchar(6)' },
    otp_expires_at: { type: 'timestamp' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  }, {
    ifNotExists: true
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('generated_users', { ifExists: true });
  pgm.dropTable('users', { ifExists: true });
};