const express = require('express')
const {loginUser, signupUser, deleteUser, getUsers, getsUsers, resetPassword, changePassword, isDefaultPassword, forgotPassword} = require('../controllers/userController')
const requireAuth = require('../middlewares/requireAuth');
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

router.patch('/reset-password/:id', resetPassword);

router.patch('/change-password',requireAuth, changePassword);

router.get('/is-default-password', requireAuth, isDefaultPassword);

router.patch('/forgot-password/:Username', forgotPassword);

module.exports = router