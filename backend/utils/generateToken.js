import jwt from 'jsonwebtoken';

const msMaxAge = 466560000000; // 180 * 30 * 24 * 60 * 60 * 1000

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '180d',
  });

  res.cookie('jwt', token, {
    httpOnly: true, // maybe change to false, if need to be read by frontend
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: msMaxAge,
  });
};

export default generateToken;
