const mongoose = require('mongoose');
const schema = mongoose.Schema;

const materialSchema = new schema({
  item: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  cost: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
});

const categorySchema = new schema({
  category: { type: String, required: true }, // e.g., "Earthwork", "Concrete"
  materials: [materialSchema] // Array of materials within the category
});

const bomSchema = new schema({
  totalArea: { type: Number, required: true },
  numFloors: { type: Number, required: true },
  avgFloorHeight: { type: Number, required: true },
  categories: [categorySchema], // Group materials by category
  laborCost: { type: Number, required: true },
  totalProjectCost: { type: Number, required: true }
});

const templatesSchema = new schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["residential"], required: true },
  tier: { type: String, enum: ["economy", "standard", "premium"], required: true },
  bom: bomSchema
}, { timestamps: true });

module.exports = mongoose.model('Template', templatesSchema);

