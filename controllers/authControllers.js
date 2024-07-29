// controllers/authController.js
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateToken, verifyToken } = require('../utils/authUtils');
const QRCode = require('qrcode');

const saltRounds = 10;

const register = (supabase) => {
  return async (req, res) => {
    const { customer_name, username, password, image } = req.body;

    if (!customer_name || !username || !password || !image) {
      return res.status(400).json({ code: 1, status: 'error', message: 'All fields are required' });
    }

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username);

      if (checkError) {
        console.error('Supabase error:', checkError);
        return res.status(500).json({ code: 1, status: 'error', message: 'Error checking username', error: checkError });
      }

      if (existingUser.length > 0) {
        return res.status(400).json({ code: 1, status: 'error', message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const { data, error } = await supabase
        .from('users')
        .insert([{ customer_name, username, password: hashedPassword, image }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const userId = data[0].id;
      const token = generateToken(userId);

      res.status(201).json({
        code: 0,
        status: 'success',
        message: 'User registered successfully',
        data,
        token
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ code: 1, status: 'error', message: 'Server error', error });
    }
  };
};

const login = (supabase) => {
  return async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 1, status: 'error', message: 'Username and password are required' });
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user) {
        console.error('Supabase error or user not found:', error);
        return res.status(400).json({ code: 1, status: 'error', message: 'Invalid username or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ code: 1, status: 'error', message: 'Invalid username or password' });
      }

      const token = generateToken(user.id);

      res.status(200).json({
        code: 0,
        status: 'success',
        message: 'Login successful.',
        data: { token }
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ code: 1, status: 'error', message: 'Server error', error });
    }
  };
};

const generateUser = (supabase) => {
  return async (req, res) => {
    const { authorization } = req.headers;
    const { unique_id, type } = req.body;

    if (!authorization) {
      return res.status(401).json({ code: 1, status: 'error', message: 'Authorization token required' });
    }

    const token = authorization.split(' ')[1];
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return res.status(401).json({ code: 1, status: 'error', message: 'Invalid token' });
    }

    const userId = decodedToken.userId;

    if (!unique_id || !type) {
      return res.status(400).json({ code: 1, status: 'error', message: 'Unique ID and type are required' });
    }

    try {
      // Fetch the authenticated user
      const { data: authenticatedUser, error: authUserError } = await supabase
        .from('users')
        .select('username, generated_username')
        .eq('id', userId)
        .single();

      if (authUserError) {
        console.error('Supabase error:', authUserError);
        return res.status(500).json({ code: 1, status: 'error', message: 'Error fetching authenticated user', error: authUserError });
      }

      const { data: existingUser, error: checkError } = await supabase
        .from('generated_users')
        .select('id, username, password')
        .eq('unique_id', unique_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Supabase error:', checkError);
        return res.status(500).json({ code: 1, status: 'error', message: 'Error checking user', error: checkError });
      }

      let user_type = 'New user';
      let username, password;

      if (existingUser) {
        user_type = 'Existing user';
        username = existingUser.username;
        password = existingUser.password;
      } else {
        username = Math.random().toString(36).substr(2, 10);
        password = Math.random().toString(36).substr(2, 8);

        const { error } = await supabase
          .from('generated_users')
          .insert([{ unique_id, type, username, password }]);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        // Append the new generated username to the existing list
        const currentGeneratedUsernames = authenticatedUser.generated_username || '';
        const updatedGeneratedUsernames = currentGeneratedUsernames
          ? `${currentGeneratedUsernames},${username}`
          : username;

        // Update the users table with the appended generated username
        const { error: updateError } = await supabase
          .from('users')
          .update({ generated_username: updatedGeneratedUsernames })
          .eq('id', userId);

        if (updateError) {
          console.error('Supabase error:', updateError);
          throw updateError;
        }
      }

      const qrCodeData = JSON.stringify({ username, password });
      const qr_code = (await QRCode.toDataURL(qrCodeData, { width: 220, height: 220 })).replace('data:image/png;base64,', '');

      res.status(200).json({
        code: 0,
        status: 'success',
        message: 'User generated successfully',
        data: {
          qr_code,
          username,
          password,
          user_type
        }
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ code: 1, status: 'error', message: 'Server error', error });
    }
  };
};

const verifyUser = (supabase) => {
  return async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 1, status: 'error', message: 'Username and password are required' });
    }

    try {
      // Verify username and password from generated_users table
      const { data: generatedUser, error: userError } = await supabase
        .from('generated_users')
        .select('password')
        .eq('username', username)
        .single();

      if (userError || !generatedUser) {
        return res.status(401).json({ code: 1, status: 'error', message: 'Invalid username or password' });
      }

      const passwordsMatch = password === generatedUser.password;

      if (!passwordsMatch) {
        return res.status(401).json({ code: 1, status: 'error', message: 'Invalid username or password' });
      }

      // Fetch customer details from users table using the generated_username
      const { data: customers, error: customerError } = await supabase
        .from('users')
        .select('customer_name, image, generated_username')
        .filter('generated_username', 'ilike', `%${username}%`);

      if (customerError) {
        console.error('Supabase error:', customerError);
        return res.status(500).json({ code: 1, status: 'error', message: 'Error fetching customer details', error: customerError });
      }

      if (customers.length === 0) {
        return res.status(404).json({ code: 1, status: 'error', message: 'Customer details not found' });
      }

      // Find the exact match from the results
      const customer = customers.find(c => 
        c.generated_username.split(',').some(gen => gen.trim() === username)
      );

      if (!customer) {
        return res.status(404).json({ code: 1, status: 'error', message: 'Exact customer match not found' });
      }

      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiresSeconds = 60;
      const otpExpiresAt = new Date(new Date().getTime() + otpExpiresSeconds * 1000).toISOString();

      // Update the OTP in the generated_users table
      const { error: otpError } = await supabase
        .from('generated_users')
        .update({ otp, otp_expires_at: otpExpiresAt })
        .eq('username', username);

      if (otpError) {
        console.error('Supabase error:', otpError);
        return res.status(500).json({ code: 1, status: 'error', message: 'Error updating OTP', error: otpError });
      }

      // Return the response
      res.status(200).json({
        code: 0,
        status: 'success',
        message: 'Username and password verified',
        data: {
          username,
          otp,
          otp_expires_seconds: otpExpiresSeconds,
          company_name: customer.customer_name,
          customer_logo: customer.image
        }
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ code: 1, status: 'error', message: 'Server error', error });
    }
  };
};

const generateOtp = (supabase) => {
  return async (req, res) => {
    const { usernames } = req.body;

    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ code: 1, status: 'error', message: 'Valid usernames array is required' });
    }

    try {
      const otpExpiresSeconds = 60;
      const results = [];

      for (const username of usernames) {
        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiresAt = new Date(new Date().getTime() + otpExpiresSeconds * 1000).toISOString();

        // Update the OTP in the generated_users table
        const { error: otpError } = await supabase
          .from('generated_users')
          .update({ otp, otp_expires_at: otpExpiresAt })
          .eq('username', username);

        if (otpError) {
          console.error('Supabase error for username', username, ':', otpError);
          // If there's an error, we'll skip this username and continue with others
          continue;
        }

        results.push({
          username,
          otp,
          otp_expires_seconds: otpExpiresSeconds
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ code: 1, status: 'error', message: 'No valid usernames found or OTP generation failed for all usernames' });
      }

      // Return the response
      res.status(200).json({
        code: 0,
        status: 'success',
        message: 'OTP Token generated successfully',
        data: results
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ code: 1, status: 'error', message: 'Server error', error });
    }
  };
};

const verifyOtp = (supabase) => {
  return async (req, res) => {
    const { unique_id, token } = req.body;

    if (!unique_id || !token) {
      return res.status(400).json({ code: 1, status: 'error', message: 'Unique ID and token are required' });
    }

    try {
      // Verify the unique_id and token from generated_users table
      const { data: generatedUser, error: genUserError } = await supabase
        .from('generated_users')
        .select('id')
        .eq('unique_id', unique_id)
        .eq('otp', token)
        .single();

      if (genUserError || !generatedUser) {
        return res.status(401).json({ code: 1, status: 'error', message: 'Invalid unique ID or expired token' });
      }

      res.status(200).json({
        code: 0,
        status: 'success',
        message: 'Token is valid.',
        data: []
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ code: 1, status: 'error', message: 'Server error', error });
    }
  };
};

module.exports = { register, login, generateUser, verifyUser, generateOtp, verifyOtp };