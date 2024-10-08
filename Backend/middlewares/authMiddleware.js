const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');
const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = await User.findOne({ _id: decoded._id }).select('_id role Username'); // Attach role and Username for permission checks
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};


const authMaterials = (permissions) => {
  return (req, res, next) => {
    const userRole = req.body.role
    if(permissions.includes(userRole)) {
      next()
    } else {
      return res.status(404).json("you dont have permission")
    }
  }
}

// must change or update may mali ka dito linagyan mo lang ng lunas
const authTemplates = (permissions) => {
  return (req, res, next) => {
    const userRole = req.body.role
    next()
  }
}

const authLocations = (permissions) => {
  return (req, res, next) => {
    const userRole = req.body.role
    if(permissions.includes(userRole)) {
      next()
    } else {
      return res.status(404).json("you dont have permission")
    }
  }
}



module.exports = {
  authMaterials,
  authTemplates,
  authLocations,
  authMiddleware
}