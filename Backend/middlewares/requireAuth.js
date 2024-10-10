const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');

const requireAuth = async (req, res, next) => {
  // Check if authorization header exists
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  // Get the token from the "Bearer <token>" format
  const token = authorization.split(' ')[1];

  try {
    // Verify the token and extract the user ID (_id)
    const { _id } = jwt.verify(token, process.env.SECRET);

    // Attach the user ID to the request object
    req.user = await User.findById(_id).select('_id');
    
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = requireAuth;
