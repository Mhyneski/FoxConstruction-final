const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Task Schema with isManual flag
const taskSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isManual: {
    type: Boolean,
    default: false
  }
});

// Floor Schema with isManual flag and tasks
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
  isManual: {
    type: Boolean,
    default: false
  },
  tasks: [taskSchema]
}, { timestamps: true });

// Project Schema with isManualProgress and referenceDate
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contractor: { type: String, required: true },
  user: { type: String, required: true },
  floors: [floorSchema],
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  timeline: {
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    unit: { 
      type: String, 
      enum: ['weeks', 'months'], 
      default: 'months' 
    },
  },
  location: { type: String, required: true },
  totalArea: { type: Number, required: true },
  avgFloorHeight: { type: Number, required: true },
  roomCount: { type: Number, default: 1 },
  foundationDepth: { type: Number, default: 1 },
  status: { 
    type: String, 
    enum: ['not started', 'ongoing', 'postponed', 'finished'], 
    default: 'not started' 
  },
  startDate: { type: Date },
  endDate: { type: Date },
  postponedDates: { type: [Date], default: [] },
  resumedDates: { type: [Date], default: [] },
  bom: {
    projectDetails: { type: Object, default: {} },
    categories: [
      {
        category: { type: String, required: true },
        materials: [
          {
            item: { type: String, required: true },
            description: { type: String },
            quantity: { type: Number, required: true, min: 0 },
            unit: { type: String, required: true },
            cost: { type: Number, required: true, min: 0 },
            totalAmount: { type: Number, required: true, min: 0 }
          },
        ],
      },
    ],
    originalCosts: { type: Object, default: {} },
    markedUpCosts: { type: Object, default: {} },
  },
  progress: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  isManualProgress: { 
    type: Boolean, 
    default: false 
  },
  referenceDate: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
