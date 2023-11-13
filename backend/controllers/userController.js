import asyncHandler from 'express-async-handler';
import pool from '../db/connectDB.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user/set token
// route    POST api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // TODO: validate username and password

  // get the user from db
  const getUserQuery = await pool.query('SELECT id, username, password FROM users WHERE username = $1', [username]);
  const [user] = getUserQuery.rows;

  if (user && (await bcrypt.compare(password, user.password))) {
    generateToken(res, user.id)
    res.status(200).json({
      id: user.id,
      username: user.username,
      steamId: user.steamId
    });
  } else {
    res.status(401);
    throw new Error('Invalid username or password');
  }
});

// @desc    Register a new user
// route    POST api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  let { username, password, steamId } = req.body;
  
  // check if username already exists
  const checkUserQuery = await pool.query('SELECT username FROM users WHERE username = $1', [username]);
  const [userExists] = checkUserQuery.rows;
  if (userExists) {
    res.status(400);
    throw new Error('Username is already in use. Try another username.');
  }

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  // insert user to users table
  await pool.query('INSERT INTO users(username, password, steamId) VALUES($1, $2, $3)', [username, password, steamId]);
  
  // get that user from db, to confirm it was inserted
  const checkUserWasAddedQuery = await pool.query('SELECT id, username, steamId FROM users WHERE username = $1', [username]);
  const [user] = checkUserWasAddedQuery.rows;
  if (user) {
    generateToken(res, user.id)
    res.status(201).json({
      id: user.id,
      username: user.username,
      steamId: user.steamId
    });
  } else {
    res.status(500);
    throw new Error('Something went wrong when creating the user');
  }
});

// @desc    Logout user
// route    POST api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    maxAge: new Date(0),
  })

  res.status(200).json({ message: 'User logged out' });
});

// @desc    Get user profile
// route    GET api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    id: req.user.id,
    username: req.user.username,
  }

  res.status(200).json(user);
});

// @desc    Update user profile
// route    PUT api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  console.log(req.user);
  const getUserQuery = await pool.query('SELECT id, username, password, steamId FROM users WHERE id = $1', [req.user.id]);
  const [user] = getUserQuery.rows;
  if (user) {
    // create newUserData object and populate with old values
    const newUserData = {
      username: user.username,
      password: user.password,
      steamId: user.steamId,
    };

    if (req.body.username && req.body.username !== user.username) {
      
      newUserData.username = req.body.username;
    }

    if (req.body.steamId && req.body.steamId !== user.steamId) {
      newUserData.steamId = req.body.steamId;
    }

    if (req.body.password && !await bcrypt.compare(req.body.password, user.password)) {
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(req.body.password, salt);
      newUserData.password = newPassword;
    }

    // TODO: validate username and password before updating in db

    await pool.query(
      'UPDATE users SET(username, password, steamId) = ($1, $2, $3) WHERE id = $4',
      [newUserData.username, newUserData.password, newUserData.steamId, req.user.id]
    );

    const getUpdatedUserQuery = await pool.query('SELECT id, username, steamId FROM users WHERE id = $1', [req.user.id]);
    const [updatedUser] = getUpdatedUserQuery.rows;
    res.status(200).json({
      id: updatedUser.id,
      username: updatedUser.username,
      steamId: updatedUser.steamId,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};