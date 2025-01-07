const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_KEY = process.env.JWT_KEY;

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    
 
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }


    req.user = user;
    next();
  } catch (err) {
    
  }
};