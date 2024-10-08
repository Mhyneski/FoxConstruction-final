const express = require('express')
const {loginUser, signupUser, deleteUser, getUsers, getsUsers} = require('../controllers/userController')

const router = express.Router();

// get all locations
router.get('/', getUsers)

// login route 
router.post('/login', loginUser)

// sign-up route
router.post('/signup', signupUser)

// delete user
router.delete('/:id', deleteUser)

router.get('/get', getsUsers);

module.exports = router