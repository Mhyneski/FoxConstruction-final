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
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  template: {
    type: String,
    enum: ["economy", "standard", "premium"],
    required: true
  },
  floors: [floorSchema],
  timeline: {
    duration: { type: Number, required: true }, // Duration value
    unit: { type: String, enum: ['weeks', 'months'], required: true } // Unit of the timeline
  },
  status: {
    type: String,
    enum: ["ongoing", "finished"],
    default: "ongoing" // Default value
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
