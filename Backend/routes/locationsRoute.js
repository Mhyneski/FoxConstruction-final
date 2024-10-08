const express = require('express')
const {
  getLocations,
  getOneLocation,
  createLocation,
  deleteLocation,
  updateLocation
} = require('../controllers/locationController')

const router = express.Router();

// get all locations
router.get('/', getLocations)

// get specific location
router.get('/:id', getOneLocation)

// create a new location
router.post('/', createLocation)

// delete a location
router.delete('/:id', deleteLocation)

// update a location
router.patch('/:id', updateLocation)

module.exports = router