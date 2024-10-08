const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./usersModel');


const taskSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100
  }
});

const floorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tasks: [taskSchema]
}, { timestamps: true });


const projectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  contractor: {
    type: String, // Store only the name of the contractor
    required: true
  },
  user: {
    type: String, // Store only the name of the user
    required: true
  },
  template: {
    type: String,
    enum: ["low", "mid", "high"], // Reference tier directly as a string with predefined values
    required: true,
  },
  floors: [floorSchema], // Array of floors with progress
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
