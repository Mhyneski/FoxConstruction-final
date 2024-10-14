const { default: mongoose } = require('mongoose');
const Material = require('../models/materialsModel');

// get all materials
const getMaterials = async(req, res) => {
  try {
    const materials = await Material.find({}).sort({createdAt: -1})
    res.status(200).json(materials)
  } catch (error) {
    res.status(404).json({error: error.message})
  }
}

// create a new material
const createMaterial = async(req, res) => {
  const {description, unit, cost} = req.body
  
  //add this to db
  try {
    const material = await Material.create({description, unit, cost})
    res.status(200).json(material)
  } catch (error) {
    res.status(404).json({error: error.message})
  }
}

// get single material
const getOneMaterial = async (req, res) => {
  const { id } = req.params

  if(!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'id does not exist'})
  }
  
  const material = await Material.findById(id)

  if(!material) {
    return res.status(404).json({error: 'Material does not exist'})
  }

  res.status(200).json(material)
}

// delete a material
const deleteMaterial = async (req, res) => {
  const {id} = req.params

  if(!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'id does not exist'})
  }


  try {
    const deletedMaterial = await Material.findOneAndDelete({_id: id})
    if(!deletedMaterial) {
      return res.status(404).json({error: 'Material does not exist'})
    }
    res.status(200).json(deletedMaterial + "is deleted")
  } catch (error) {
    res.status(500).json({error: 'error occured'})
  }
}

// update a material
const updateMaterial = async (req, res) => {
  const {id} = req.params

  if(!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'id does not exist'})
  }

  try {
    const updatedMaterial = await Material.findOneAndUpdate({_id: id}, {
      ...req.body
    })
    if(!updatedMaterial) {
      return res.status(404).json({error: 'Material does not exist'})
    }
    res.status(200).json(updatedMaterial)
  } catch (error) {
    res.status(500).json({error: 'error occured'})
  }
}

module.exports = {
  createMaterial,
  getMaterials,
  deleteMaterial,
  getOneMaterial,
  updateMaterial
}