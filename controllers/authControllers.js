// controllers/authController.js
const express = require('express');
const bcrypt = require('bcrypt');
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

    if (!unique_id || !type) {
      return res.status(400).json({ code: 1, status: 'error', message: 'Unique ID and type are required' });
    }

    try {
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
      }

      const qrCodeData = JSON.stringify({ username, password });
      const qr_code = (await QRCode.toDataURL(qrCodeData, { width: 220, height: 220 })).replace('data:image/png;base64,', '');
      // const qr_code = (await QRCode.toDataURL(qrCodeData)).replace('data:image/png;base64,', '');

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

module.exports = { register, login, generateUser };
