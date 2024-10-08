const mongoose = require('mongoose');
const schema = mongoose.Schema;

const templatesSchema = new schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["residential"], 
    required: true
  },
  tier: {
    type: String,
    enum: ["low", "mid", "high"],
    required: true
  },
  bom: {
    totalArea: {
      type: Number,
      required: true
    },
    numFloors: {
      type: Number,
      required: true
    },
    avgFloorHeight: {
      type: Number,
      required: true
    },
    materials: [
      {
        item: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        category: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        unit: {
          type: String,
          required: true
        },
        unitCost: {
          type: Number,
          required: true
        },
        totalAmount: {
          type: Number,
          required: true
        }
      }
    ],
    laborCost: {
      type: Number,
      required: true
    },
    totalProjectCost: {
      type: Number,
      required: true
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Template', templatesSchema);
