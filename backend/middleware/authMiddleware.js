import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import pool from '../db/connectDB.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const getUserQuery = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    const [user] = getUserQuery.rows;
    
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401);
      throw new Error('Not authorized, invalid token');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { protect };