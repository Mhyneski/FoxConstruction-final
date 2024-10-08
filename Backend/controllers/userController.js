const user = require('../models/usersModel')
const bcryptjs = require('bcryptjs');
const { default: mongoose } = require('mongoose');   
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
 return jwt.sign({_id: _id}, process.env.SECRET, {expiresIn: '3d'})
}

// Fetch users with role 'user'
const getsUsers = async (req, res) => {
  try {
    // Find only users with the role 'user'
    const users = await user.find({ role: 'user' });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Fetch all users
const getUsers = async (req, res) => {
  try {
    const users = await user.find({}).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// login user
const loginUser = async (req, res) => {
  const { Username, password } = req.body;

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  try {
    const USER = await user.findOne({ Username });
    if (!USER) {
      return res.status(400).json({ error: 'User not found' });
    }
    // Perform password comparison
    const passwordMatch = await bcryptjs.compare(password, USER.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    //create token
    const token = createToken(USER._id)

    // If authentication is successful
    res.json({ Username, role: USER.role, token, id: USER._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
}


const signupUser = async (req, res) => {
  console.log('Request Body:', req.body); // Log the incoming request body

  const { Username, password, role } = req.body;

  if (!role) {
      return res.status(400).json({ error: 'Role is required' });
  }

  if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  try {
      // Check if the Username already exists
      const existingUser = await user.findOne({ Username });
      if (existingUser) {
          return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash the password
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Create a new user with hashed password
      const USER = await user.create({ Username, password: hashedPassword, role });

      // Create a token
      const token = createToken(USER._id);

      res.status(201).json({ message: 'User created successfully', Username, token });
  } catch (error) {
      console.error('Server Error:', error); // Log the error
      res.status(500).json({ error: 'Server Error' });
  }
}


const deleteUser = async(req, res) => {
  const {id} = req.params

  if(!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'id does not exist'})
  }

  try {
    const deletedUser = await user.findOneAndDelete({_id: id})
    if(!deletedUser) {
      return res.status(404).json({error: 'Material does not exist'})
    }
    res.status(200).json(deletedUser + " is deleted")
  } catch (error) {
    res.status(500).json({error: 'error occured'})
  }
}

module.exports = {
  loginUser,
  signupUser,
  deleteUser,
  getUsers,
  getsUsers
}