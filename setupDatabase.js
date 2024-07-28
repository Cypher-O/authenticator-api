// initializeDatabase.js
module.exports = async (supabase) => {
  try {
    // Check if the users table exists
    const { data: tableExists, error: tableExistsError } = await supabase
      .rpc('table_exists', { p_table_name: 'users' });

    if (tableExistsError) {
      console.error('Error checking users table:', tableExistsError);
      throw tableExistsError;
    }

    if (!tableExists.exists) {
      // Create the users table if it does not exist
      const { data, error } = await supabase.rpc('create_users_table');
      if (error) {
        console.error('Error creating users table:', error);
        throw error;
      }
      console.log('Users table created successfully');
    } else {
      console.log('Users table already exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
