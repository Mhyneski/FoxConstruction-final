require('dotenv').config();

const mongoose = require('mongoose');
const Template = require('./models/templatesModel'); // Adjust the path as needed

// Function to connect to MongoDB
const connectDB = async () => {
  console.log(process.env.MONGO_URI); // Debugging line
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit process with failure
  }
};


const insertBaseTemplate = async () => {
  const baseTemplate = {
    "title": "Residential 2-Floor House - Premium",
    "type": "residential",
    "tier": "premium",
    "bom": {
      "totalArea": 200,
      "numFloors": 2,
      "avgFloorHeight": 3,
      "categories": [
        {
          "category": "Earthwork",
          "materials": [
            { "item": "1.1", "description": "Site Clearing", "quantity": 1, "unit": "lot", "cost": 30000, "totalAmount": 30000 },
            { "item": "1.2", "description": "Construction Layout and Surveying", "quantity": 1, "unit": "lot", "cost": 30000, "totalAmount": 30000 },
            { "item": "1.3", "description": "Staking/ Batterboard Installation", "quantity": 1, "unit": "lot", "cost": 15000, "totalAmount": 15000 },
            { "item": "1.4", "description": "Excavation for foundation and wall footings", "quantity": 38.51, "unit": "cu.m", "cost": 500, "totalAmount": 19255 },
            { "item": "1.5", "description": "Backfill", "quantity": 116.074, "unit": "cu.m", "cost": 120, "totalAmount": 13928.88 }
          ]
        },
        {
          "category": "Concrete",
          "materials": [
            { "item": "2.1.1", "description": "Cement", "quantity": 421, "unit": "bags", "cost": 350, "totalAmount": 147350 },
            { "item": "2.1.2", "description": "Sand", "quantity": 24.5, "unit": "cu.m", "cost": 2000, "totalAmount": 49000 },
            { "item": "2.1.3", "description": "Gravel", "quantity": 41.83, "unit": "cu.m", "cost": 1800, "totalAmount": 75300 }
          ]
        },
        {
          "category": "Rebars",
          "materials": [
            { "item": "2.2.1", "description": "16mm x 6m Std. RSB", "quantity": 225, "unit": "pcs", "cost": 500, "totalAmount": 112500 },
            { "item": "2.2.2", "description": "12mm x 6m Std. RSB", "quantity": 227, "unit": "pcs", "cost": 300, "totalAmount": 68100 },
            { "item": "2.2.3", "description": "10mm x 6m Std. RSB", "quantity": 562, "unit": "pcs", "cost": 200, "totalAmount": 112400 },
            { "item": "2.2.4", "description": "No. 16 Tie wire", "quantity": 69, "unit": "kgs", "cost": 20, "totalAmount": 1380 }
          ]
        },
        {
          "category": "Formworks",
          "materials": [
            { "item": "2.3.1", "description": "4' x 8' 1/2\" Marine plywood", "quantity": 31, "unit": "shts", "cost": 1000, "totalAmount": 31000 },
            { "item": "2.3.2", "description": "2\" x 2\" x 8' Good Lumber", "quantity": 225, "unit": "pcs", "cost": 150, "totalAmount": 33750 },
            { "item": "2.3.3", "description": "Common wire nail (Assorted)", "quantity": 3, "unit": "kgs", "cost": 100, "totalAmount": 300 }
          ]
        },
        {
          "category": "Scaffoldings",
          "materials": [
            { "item": "2.4.1", "description": "2\" x 3\" x 12' Good Lumber", "quantity": 273, "unit": "pcs", "cost": 120, "totalAmount": 32760 },
            { "item": "2.4.2", "description": "2\" x 2\" x 12' Good Lumber", "quantity": 452, "unit": "pcs", "cost": 90, "totalAmount": 40680 },
            { "item": "2.4.3", "description": "Common wire nail (Assorted)", "quantity": 58, "unit": "kgs", "cost": 100, "totalAmount": 5800 }
          ]
        },
        {
          "category": "Masonry",
          "materials": [
            { "item": "2.5.1", "description": "6\" thk. CHB", "quantity": 2589, "unit": "pcs", "cost": 15, "totalAmount": 38835 },
            { "item": "2.5.2", "description": "4\" thk. CHB", "quantity": 1077, "unit": "pcs", "cost": 12, "totalAmount": 12924 },
            { "item": "2.5.3", "description": "Cement", "quantity": 415, "unit": "bags", "cost": 350, "totalAmount": 145250 },
            { "item": "2.5.4", "description": "Sand", "quantity": 30.4, "unit": "cu.m", "cost": 1000, "totalAmount": 30400 }
          ]
        },
        {
          "category": "Architectural - Tiles",
          "materials": [
            { "item": "3.1.1", "description": "Non-skid floor tile (20cm x 20cm) - *Premium Ceramic Tile*", "quantity": 158, "unit": "pcs", "cost": 50, "totalAmount": 7900 },
            { "item": "3.1.2", "description": "Toilet Wall Tile (20cm x 20cm) - *Premium Ceramic Tile*", "quantity": 473, "unit": "pcs", "cost": 50, "totalAmount": 23650 },
            { "item": "3.1.3", "description": "Tile Adhesive - *Premium Quality*", "quantity": 3, "unit": "bags", "cost": 500, "totalAmount": 1500 },
            { "item": "3.1.4", "description": "Tile Grout - *Premium Quality*", "quantity": 12, "unit": "bags", "cost": 100, "totalAmount": 1200 },
            { "item": "3.1.5", "description": "Cement Mortar - *Premium Cement*", "quantity": 3, "unit": "bags", "cost": 350, "totalAmount": 1050 }
          ]
        },
        {
          "category": "Architectural - Painting",
          "materials": [
            { "item": "3.2.1", "description": "Masonry Neutralizer - *Premium Brand*", "quantity": 25, "unit": "gal", "cost": 200, "totalAmount": 5000 },
            { "item": "3.2.2", "description": "Acrylic Gloss Latex - *Premium Paint*", "quantity": 39, "unit": "gal", "cost": 600, "totalAmount": 23400 },
            { "item": "3.2.3", "description": "Latex Colors - *Premium Color Palette*", "quantity": 156, "unit": "liters", "cost": 200, "totalAmount": 31200 },
            { "item": "3.2.4", "description": "Paint Rollers & Trays - *Premium Tools*", "quantity": 8, "unit": "pcs", "cost": 300, "totalAmount": 2400 },
            { "item": "3.2.5", "description": "Paint Brush - *Premium Quality*", "quantity": 5, "unit": "pcs", "cost": 100, "totalAmount": 500 },
            { "item": "3.2.6", "description": "Painters Tape - *Premium Tape*", "quantity": 4, "unit": "pcs", "cost": 150, "totalAmount": 600 },
            { "item": "3.2.7", "description": "Rags - *Premium Quality*", "quantity": 20, "unit": "pcs", "cost": 10, "totalAmount": 200 },
            { "item": "3.2.8", "description": "Drop Cloth - *Premium Cloth*", "quantity": 4, "unit": "pcs", "cost": 200, "totalAmount": 800 },
            { "item": "3.2.9", "description": "Miscellaneous - *Premium Supplies*", "quantity": 1, "unit": "lot", "cost": 5000, "totalAmount": 5000 }
          ]
        },
        {
          "category": "Roofing",
          "materials": [
            { "item": "4.1", "description": "Trusses and Purlins", "quantity": 1, "unit": "lot", "cost": 150000, "totalAmount": 150000 },
            { "item": "4.2.1", "description": "Pre-painted Metal Roof - *Premium Gauge Metal*", "quantity": 20, "unit": "sheets", "cost": 1500, "totalAmount": 30000 },
            { "item": "4.2.2", "description": "Pre-painted Gutter - *Premium Gutter*", "quantity": 8, "unit": "pcs", "cost": 500, "totalAmount": 4000 },
            { "item": "4.2.3", "description": "End Flashing - *Premium Flashing*", "quantity": 8, "unit": "pcs", "cost": 500, "totalAmount": 4000 },
            { "item": "4.2.4", "description": "Tekscrew - *Premium Quality*", "quantity": 9, "unit": "kgs", "cost": 300, "totalAmount": 2700 },
            { "item": "4.2.5", "description": "Hipped Roll - *Premium Quality*", "quantity": 10, "unit": "pcs", "cost": 300, "totalAmount": 3000 }
          ]
        },
        {
          "category": "Doors and Windows",
          "materials": [
            { "item": "5.1.1", "description": "Solid Wooden Panel Door, Jamb and Accessories - *Premium Quality Wood*", "quantity": 1, "unit": "set", "cost": 7000, "totalAmount": 7000 },
            { "item": "5.1.2", "description": "Fabricated Flush Door, Jamb and Accessories - *Premium Quality Plywood*", "quantity": 5, "unit": "set", "cost": 4000, "totalAmount": 20000 },
            { "item": "5.1.3", "description": "Polyvinyl Chloride Door with Louver, Jamb and Accessories - *Premium Quality PVC*", "quantity": 1, "unit": "set", "cost": 2000, "totalAmount": 2000 },
            { "item": "5.1.4", "description": "Aluminum Sliding Door and Accessories - *Premium Quality Aluminum*", "quantity": 1, "unit": "set", "cost": 20000, "totalAmount": 20000 },
            { "item": "5.2.1", "description": "1.4m x 1.2m (H) Aluminum Sliding Window - *Premium Quality Aluminum*", "quantity": 1, "unit": "set", "cost": 15000, "totalAmount": 15000 },
            { "item": "5.2.2", "description": "1.5m x 0.5m (H) Aluminum Awning Window - *Premium Quality*", "quantity": 1, "unit": "set", "cost": 2000, "totalAmount": 2000 },
            { "item": "5.2.3", "description": "1.6m x 1.2m (H) Aluminum Sliding Window - *Premium Quality Aluminum*", "quantity": 6, "unit": "set", "cost": 15000, "totalAmount": 90000 },
            { "item": "5.2.4", "description": "0.5m x 0.5m (H) Aluminum Awning Window - *Premium Quality*", "quantity": 1, "unit": "set", "cost": 1000, "totalAmount": 1000 }
          ]
        },
        {
          "category": "Electrical",
          "materials": [
            { "item": "6.1.1", "description": "20 Watts LED Circular Lamp with Glass Cover", "quantity": 8, "unit": "pcs", "cost": 1500, "totalAmount": 12000 },
            { "item": "6.1.2", "description": "10 Watts LED Pin Light with Housing", "quantity": 6, "unit": "pcs", "cost": 500, "totalAmount": 3000 },
            { "item": "6.1.3", "description": "Duplex Convenient Outlet", "quantity": 12, "unit": "pcs", "cost": 300, "totalAmount": 3600 },
            { "item": "6.1.4", "description": "Single Gang Switch w/ plate & cover", "quantity": 6, "unit": "pcs", "cost": 200, "totalAmount": 1200 },
            { "item": "6.1.5", "description": "Two Gang Switch w/ plate & cover", "quantity": 4, "unit": "pcs", "cost": 300, "totalAmount": 1200 },
            { "item": "6.2.1", "description": "2.0mm² THHN Stranded Wire", "quantity": 115.5, "unit": "m", "cost": 30, "totalAmount": 3465 },
            { "item": "6.2.2", "description": "½\" x 3m PVC Pipe Conduit", "quantity": 21, "unit": "pcs", "cost": 80, "totalAmount": 1680 },
            { "item": "6.2.3", "description": "1.5\" x 10 ft RSC Pipe", "quantity": 1, "unit": "pcs", "cost": 1000, "totalAmount": 1000 },
            { "item": "6.2.4", "description": "1.5\" Entrance Cap", "quantity": 1, "unit": "pcs", "cost": 300, "totalAmount": 300 },
            { "item": "6.2.5", "description": "½\" x 90° Long Elbow", "quantity": 4, "unit": "pcs", "cost": 50, "totalAmount": 200 },
            { "item": "6.2.6", "description": "Electrical Tape", "quantity": 7, "unit": "pcs", "cost": 100, "totalAmount": 700 },
            { "item": "6.2.7", "description": "4\" x 4\" PVC Junction Box w/ Cover", "quantity": 14, "unit": "pcs", "cost": 80, "totalAmount": 1120 },
            { "item": "6.2.8", "description": "2\" x 4\" Utility Box", "quantity": 14, "unit": "pcs", "cost": 80, "totalAmount": 1120 },
            { "item": "6.3", "description": "Power Panel", "quantity": 1, "unit": "lot", "cost": 10000, "totalAmount": 10000 },
            { "item": "6.4", "description": "Power Supply Connectom", "quantity": 1, "unit": "lot", "cost": 20000, "totalAmount": 20000 }
          ]
        },
        {
          "category": "Plumbing",
          "materials": [
            { "item": "7.1", "description": "100mm Diameter PVC Pipe", "quantity": 20, "unit": "L-m", "cost": 150, "totalAmount": 3000 },
            { "item": "7.2", "description": "100mm Diameter Wye", "quantity": 1, "unit": "pcs", "cost": 150, "totalAmount": 150 },
            { "item": "7.3", "description": "100mm Diameter U-Fitting", "quantity": 1, "unit": "pcs", "cost": 300, "totalAmount": 300 },
            { "item": "7.4", "description": "100mm Diameter Floor Drain", "quantity": 1, "unit": "pcs", "cost": 350, "totalAmount": 350 },
            { "item": "7.5", "description": "100mm Diameter Floor Clean Out", "quantity": 2, "unit": "pcs", "cost": 50, "totalAmount": 100 },
            { "item": "7.6", "description": "75mm Diameter PVC Pipe", "quantity": 55, "unit": "L-m", "cost": 120, "totalAmount": 6600 },
            { "item": "7.7", "description": "75mm Diameter Wye", "quantity": 5, "unit": "pcs", "cost": 100, "totalAmount": 500 },
            { "item": "7.8", "description": "75mm Diameter Elbow", "quantity": 4, "unit": "pcs", "cost": 120, "totalAmount": 480 },
            { "item": "7.9", "description": "50mm Diameter PVC Pipe", "quantity": 12, "unit": "L-m", "cost": 100, "totalAmount": 1200 },
            { "item": "7.10", "description": "50mm Diameter U-Trap", "quantity": 3, "unit": "pcs", "cost": 300, "totalAmount": 900 },
            { "item": "7.11", "description": "50mm Diameter Elbow", "quantity": 10, "unit": "pcs", "cost": 60, "totalAmount": 600 },
            { "item": "7.12", "description": "20mm Diameter PVC Pipe", "quantity": 30, "unit": "L-m", "cost": 70, "totalAmount": 2100 },
            { "item": "7.13", "description": "20mm Diameter Elbow", "quantity": 16, "unit": "pcs", "cost": 70, "totalAmount": 1120 },
            { "item": "7.14", "description": "20mm Diameter Tee", "quantity": 2, "unit": "pcs", "cost": 70, "totalAmount": 140 },
            { "item": "7.15", "description": "20mm Diameter Gate Valve", "quantity": 1, "unit": "pcs", "cost": 700, "totalAmount": 700 },
            { "item": "7.16", "description": "Water Closet Flush Type", "quantity": 1, "unit": "set", "cost": 8000, "totalAmount": 8000 },
            { "item": "7.17", "description": "Lavatory", "quantity": 1, "unit": "pcs", "cost": 8000, "totalAmount": 8000 },
            { "item": "7.18", "description": "Faucet", "quantity": 3, "unit": "pcs", "cost": 300, "totalAmount": 900 },
            { "item": "7.19", "description": "Water Meter", "quantity": 1, "unit": "pcs", "cost": 2000, "totalAmount": 2000 },
            { "item": "7.20", "description": "Kitchen Sink", "quantity": 1, "unit": "pcs", "cost": 1000, "totalAmount": 1000 },
            { "item": "7.21", "description": "Shower Set", "quantity": 1, "unit": "set", "cost": 5000, "totalAmount": 5000 }
          ]
        },
        {
          "category": "Septic Tank and Catch Basins",
          "materials": [
            { "item": "8.1", "description": "Excavation", "quantity": 7.5, "unit": "cu.m", "cost": 400, "totalAmount": 3000 },
            { "item": "8.2", "description": "4\" CHB", "quantity": 250, "unit": "pcs", "cost": 15, "totalAmount": 3750 },
            { "item": "8.3", "description": "Cement", "quantity": 12, "unit": "bags", "cost": 350, "totalAmount": 4200 },
            { "item": "8.4", "description": "Sand", "quantity": 1.34, "unit": "cu.m", "cost": 2000, "totalAmount": 2680 },
            { "item": "8.5", "description": "Gravel", "quantity": 0.5, "unit": "cu.m", "cost": 1800, "totalAmount": 900 },
            { "item": "8.6", "description": "10mm x 6m Std. RSB", "quantity": 20, "unit": "pcs", "cost": 200, "totalAmount": 4000 },
            { "item": "8.7", "description": "#16 Tie Wire", "quantity": 0.9, "unit": "kgs", "cost": 20, "totalAmount": 18 }
          ]
        }
      ],
      "laborCost": 400000,
      "totalProjectCost": 1600000
    }
  };
  
  try {
    await Template.create(baseTemplate);
    console.log('Base template created successfully');
  } catch (err) {
    console.error('Error creating base template:', err);
  } finally {
    mongoose.disconnect();
  }
};


const run = async () => {
  await connectDB();
  await insertBaseTemplate();
};

run();
