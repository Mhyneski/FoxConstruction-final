const express = require('express')

const router = express.Router();

// get all templates
router.get('/')

// get specific template
router.get('/:id')

// create a new template
router.post('/')

// delete a template
router.delete('/:id')

// update a template
router.patch('/:id')

module.exports = router