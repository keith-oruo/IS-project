const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader); // Log the incoming header

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Authentication error: Token is missing or malformed');
    return res.status(403).json({ error: 'Token is missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    console.log('👉 req.user:', req.user); // Moved inside the function
    next();
  } catch (err) {
    console.error('Invalid token:', err.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
}



module.exports = verifyToken;