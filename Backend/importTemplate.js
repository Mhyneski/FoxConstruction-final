require('dotenv').config();

const mongoose = require('mongoose');
const Template = require('./models/templatesModel'); 


const connectDB = async () => {
  console.log(process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); 
  }
};


const insertBaseTemplate = async () => {
  const baseTemplate = {
    "title": "Residential 2-Floor House - Economy",
    "type": "residential",
    "tier": "economy",
    "bom": {
      "totalArea": 200,
      "numFloors": 2,
      "avgFloorHeight": 3,
      "categories": [
        {
          "category": "Earthwork",
          "materials": [
            { "item": "1.1", "description": "Site Clearing", "quantity": 1, "unit": "lot", "cost": 15000, "totalAmount": 15000 },
            { "item": "1.2", "description": "Construction Layout and Surveying", "quantity": 1, "unit": "lot", "cost": 15000, "totalAmount": 15000 },
            { "item": "1.3", "description": "Staking/ Batterboard Installation", "quantity": 1, "unit": "lot", "cost": 8000, "totalAmount": 8000 },
            { "item": "1.4", "description": "Excavation for foundation and wall footings", "quantity": 38.51, "unit": "cu.m", "cost": 200, "totalAmount": 7702 },
            { "item": "1.5", "description": "Backfill", "quantity": 116.074, "unit": "cu.m", "cost": 60, "totalAmount": 6964.44 }
          ]
        },
        {
          "category": "Concrete",
          "materials": [
            { "item": "2.1.1", "description": "Cement", "quantity": 421, "unit": "bags", "cost": 200, "totalAmount": 84200 },
            { "item": "2.1.2", "description": "Sand", "quantity": 24.5, "unit": "cu.m", "cost": 1200, "totalAmount": 29400 },
            { "item": "2.1.3", "description": "Gravel", "quantity": 41.83, "unit": "cu.m", "cost": 1100, "totalAmount": 46013 }
          ]
        },
        {
          "category": "Rebars",
          "materials": [
            { "item": "2.2.1", "description": "16mm x 6m Std. RSB", "quantity": 225, "unit": "pcs", "cost": 350, "totalAmount": 78750 },
            { "item": "2.2.2", "description": "12mm x 6m Std. RSB", "quantity": 227, "unit": "pcs", "cost": 200, "totalAmount": 45400 },
            { "item": "2.2.3", "description": "10mm x 6m Std. RSB", "quantity": 562, "unit": "pcs", "cost": 140, "totalAmount": 78680 },
            { "item": "2.2.4", "description": "No. 16 Tie wire", "quantity": 69, "unit": "kgs", "cost": 12, "totalAmount": 828 }
          ]
        },
        {
          "category": "Formworks",
          "materials": [
            { "item": "2.3.1", "description": "4' x 8' 1/2\" Ordinary plywood", "quantity": 31, "unit": "shts", "cost": 500, "totalAmount": 15500 },
            { "item": "2.3.2", "description": "2\" x 2\" x 8' Coco Lumber", "quantity": 225, "unit": "pcs", "cost": 80, "totalAmount": 18000 },
            { "item": "2.3.3", "description": "Common wire nail (Assorted)", "quantity": 3, "unit": "kgs", "cost": 60, "totalAmount": 180 }
          ]
        },
        {
          "category": "Scaffoldings",
          "materials": [
            { "item": "2.4.1", "description": "2\" x 3\" x 12' Coco Lumber", "quantity": 273, "unit": "pcs", "cost": 60, "totalAmount": 16380 },
            { "item": "2.4.2", "description": "2\" x 2\" x 12' Coco Lumber", "quantity": 452, "unit": "pcs", "cost": 40, "totalAmount": 18080 },
            { "item": "2.4.3", "description": "Common wire nail (Assorted)", "quantity": 58, "unit": "kgs", "cost": 55, "totalAmount": 3190 }
          ]
        },
        {
          "category": "Masonry",
          "materials": [
            { "item": "2.5.1", "description": "6\" thk. CHB", "quantity": 2589, "unit": "pcs", "cost": 10, "totalAmount": 25890 },
            { "item": "2.5.2", "description": "4\" thk. CHB", "quantity": 1077, "unit": "pcs", "cost": 8, "totalAmount": 8616 },
            { "item": "2.5.3", "description": "Cement", "quantity": 415, "unit": "bags", "cost": 200, "totalAmount": 83000 },
            { "item": "2.5.4", "description": "Sand", "quantity": 30.4, "unit": "cu.m", "cost": 600, "totalAmount": 18240 }
          ]
        },
        {
          "category": "Architectural - Tiles",
          "materials": [
            { "item": "3.1.1", "description": "Non-skid floor tile - Berlin Gris (20cm x 20cm) - *Basic Ceramic Tile*", "quantity": 158, "unit": "pcs", "cost": 15, "totalAmount": 2370 },
            { "item": "3.1.2", "description": "Toilet Wall Tile - Enrica Light Brown (20cm x 20cm) - *Basic Ceramic Tile*", "quantity": 473, "unit": "pcs", "cost": 10, "totalAmount": 4730 },
            { "item": "3.1.3", "description": "Tile Adhesive - Holcim tile adhesive - *Economy Quality*", "quantity": 3, "unit": "bags", "cost": 210, "totalAmount": 630 },
            { "item": "3.1.4", "description": "Tile Grout - ABC grout - *Economy Quality*", "quantity": 12, "unit": "bags", "cost": 180, "totalAmount": 2160 },
            { "item": "3.1.5", "description": "Cement Mortar - Holcim Cement - *Basic Cement*", "quantity": 3, "unit": "bags", "cost": 270, "totalAmount": 810 }
          ]
        },
        {
          "category": "Roofing",
          "materials": [
            { "item": "4.1", "description": "Trusses and Purlins", "quantity": 1, "unit": "lot", "cost": 100000, "totalAmount": 100000 },
            { "item": "4.2.1", "description": "Pre-painted Metal Roof - Pre-painted Metal Roofing Sheet  - *Thinner Gauge Metal*", "quantity": 20, "unit": "sheets", "cost": 385, "totalAmount": 7700 },
            { "item": "4.2.2", "description": "Pre-painted Gutter - Pre-painted Valley Gutter - *Economy Gutter*", "quantity": 8, "unit": "pcs", "cost": 333, "totalAmount": 2664 },
            { "item": "4.2.3", "description": "End Flashing - Galvanized Steel Flashing - *Economy Flashing*", "quantity": 8, "unit": "pcs", "cost": 200, "totalAmount": 1600 },
            { "item": "4.2.4", "description": "Tekscrew - *Economy Quality*", "quantity": 9, "unit": "kgs", "cost": 150, "totalAmount": 1350 },
            { "item": "4.2.5", "description": "Hipped Roll - Corrugated Hipped Roll Roofing - *Economy Quality*", "quantity": 10, "unit": "pcs", "cost": 120, "totalAmount": 1200 }
          ]
        },
        {
          "category": "Doors and Windows",
          "materials": [
            { "item": "5.1.1", "description": "Solid Wooden Panel Door, Jamb and Hinge - *Economy Quality Wood*", "quantity": 1, "unit": "set", "cost": 2662, "totalAmount": 2662 },
            { "item": "5.1.2", "description": "Fabricated Flush Door, Jamb and Hinge- *Economy Quality Plywood*", "quantity": 5, "unit": "set", "cost": 1520, "totalAmount": 7600 },
            { "item": "5.1.3", "description": "Polyvinyl Chloride Door with Louver, Jamb and Hinge- *Economy Quality PVC*", "quantity": 1, "unit": "set", "cost": 1500, "totalAmount": 1500 },
            { "item": "5.1.4", "description": "Aluminum Sliding Door and Accessories - Rustic Interior Wood Barn Sliding Door with Carbon Steel Track - *Economy Quality Aluminum*", "quantity": 1, "unit": "set", "cost": 1630, "totalAmount": 1630 },
            { "item": "5.2.1", "description": "1.4m x 1.2m (H) Aluminum Sliding Window - *Economy Quality Aluminum*", "quantity": 1, "unit": "set", "cost": 2600, "totalAmount": 2600 },
            { "item": "5.2.2", "description": "1.5m x 0.5m (H) Aluminum Awning Window - *Economy Quality*", "quantity": 1, "unit": "set", "cost": 2650, "totalAmount": 2650 },
            { "item": "5.2.3", "description": "1.6m x 1.2m (H) Aluminum Sliding Window - *Economy Quality Aluminum*", "quantity": 6, "unit": "set", "cost": 3000, "totalAmount": 18000 },
            { "item": "5.2.4", "description": "0.5m x 0.5m (H) Aluminum Awning Window - *Economy Quality*", "quantity": 1, "unit": "set", "cost": 2200, "totalAmount": 2400 }
          ]
        },
        {
          "category": "Electrical",
          "materials": [
            { "item": "6.1.1", "description": "20 Watts LED Circular Lamp with Glass Cover", "quantity": 8, "unit": "pcs", "cost": 1000, "totalAmount": 8000 },
            { "item": "6.1.2", "description": "10 Watts LED Pin Light with Housing", "quantity": 6, "unit": "pcs", "cost": 250, "totalAmount": 1500 },
            { "item": "6.1.3", "description": "Duplex Convenient Outlet", "quantity": 12, "unit": "pcs", "cost": 150, "totalAmount": 1800 },
            { "item": "6.1.4", "description": "Single Gang Switch w/ plate & cover", "quantity": 6, "unit": "pcs", "cost": 100, "totalAmount": 600 },
            { "item": "6.1.5", "description": "Two Gang Switch w/ plate & cover", "quantity": 4, "unit": "pcs", "cost": 150, "totalAmount": 600 },
            { "item": "6.2.1", "description": "2.0mm² THHN Stranded Wire", "quantity": 115.5, "unit": "m", "cost": 15, "totalAmount": 1732.5 },
            { "item": "6.2.2", "description": "½\" x 3m PVC Pipe Conduit", "quantity": 21, "unit": "pcs", "cost": 50, "totalAmount": 1050 },
            { "item": "6.2.3", "description": "1.5\" x 10 ft RSC Pipe", "quantity": 1, "unit": "pcs", "cost": 500, "totalAmount": 500 },
            { "item": "6.2.4", "description": "1.5\" Entrance Cap", "quantity": 1, "unit": "pcs", "cost": 150, "totalAmount": 150 },
            { "item": "6.2.5", "description": "½\" x 90° Long Elbow", "quantity": 4, "unit": "pcs", "cost": 20, "totalAmount": 80 },
            { "item": "6.2.6", "description": "Electrical Tape", "quantity": 7, "unit": "pcs", "cost": 50, "totalAmount": 350 },
            { "item": "6.2.7", "description": "4\" x 4\" PVC Junction Box w/ Cover", "quantity": 14, "unit": "pcs", "cost": 40, "totalAmount": 560 },
            { "item": "6.2.8", "description": "2\" x 4\" Utility Box", "quantity": 14, "unit": "pcs", "cost": 40, "totalAmount": 560 },
            { "item": "6.3", "description": "Power Panel", "quantity": 1, "unit": "lot", "cost": 5000, "totalAmount": 5000 },
            { "item": "6.4", "description": "Power Supply Connection", "quantity": 1, "unit": "lot", "cost": 12000, "totalAmount": 12000 }
          ]
        },
        {
          "category": "Plumbing",
          "materials": [
            { "item": "7.1", "description": "100mm Diameter PVC Pipe", "quantity": 20, "unit": "L-m", "cost": 100, "totalAmount": 2000 },
            { "item": "7.2", "description": "100mm Diameter Wye", "quantity": 1, "unit": "pcs", "cost": 80, "totalAmount": 80 },
            { "item": "7.3", "description": "100mm Diameter U-Fitting", "quantity": 1, "unit": "pcs", "cost": 200, "totalAmount": 200 },
            { "item": "7.4", "description": "100mm Diameter Floor Drain", "quantity": 1, "unit": "pcs", "cost": 150, "totalAmount": 150 },
            { "item": "7.5", "description": "100mm Diameter Floor Clean Out", "quantity": 2, "unit": "pcs", "cost": 30, "totalAmount": 60 },
            { "item": "7.6", "description": "75mm Diameter PVC Pipe", "quantity": 55, "unit": "L-m", "cost": 60, "totalAmount": 3300 },
            { "item": "7.7", "description": "75mm Diameter Wye", "quantity": 5, "unit": "pcs", "cost": 60, "totalAmount": 300 },
            { "item": "7.8", "description": "75mm Diameter Elbow", "quantity": 4, "unit": "pcs", "cost": 70, "totalAmount": 280 },
            { "item": "7.9", "description": "50mm Diameter PVC Pipe", "quantity": 12, "unit": "L-m", "cost": 60, "totalAmount": 720 },
            { "item": "7.10", "description": "50mm Diameter U-Trap", "quantity": 3, "unit": "pcs", "cost": 200, "totalAmount": 600 },
            { "item": "7.11", "description": "50mm Diameter Elbow", "quantity": 10, "unit": "pcs", "cost": 30, "totalAmount": 300 },
            { "item": "7.12", "description": "20mm Diameter PVC Pipe", "quantity": 30, "unit": "L-m", "cost": 40, "totalAmount": 1200 },
            { "item": "7.13", "description": "20mm Diameter Elbow", "quantity": 16, "unit": "pcs", "cost": 40, "totalAmount": 640 },
            { "item": "7.14", "description": "20mm Diameter Tee", "quantity": 2, "unit": "pcs", "cost": 40, "totalAmount": 80 },
            { "item": "7.15", "description": "20mm Diameter Gate Valve", "quantity": 1, "unit": "pcs", "cost": 400, "totalAmount": 400 },
            { "item": "7.16", "description": "Water Closet Flush Type", "quantity": 1, "unit": "set", "cost": 5000, "totalAmount": 5000 },
            { "item": "7.17", "description": "Lavatory", "quantity": 1, "unit": "pcs", "cost": 5000, "totalAmount": 5000 },
            { "item": "7.18", "description": "Faucet", "quantity": 3, "unit": "pcs", "cost": 150, "totalAmount": 450 },
            { "item": "7.19", "description": "Water Meter", "quantity": 1, "unit": "pcs", "cost": 1200, "totalAmount": 1200 },
            { "item": "7.20", "description": "Kitchen Sink", "quantity": 1, "unit": "pcs", "cost": 400, "totalAmount": 400 },
            { "item": "7.21", "description": "Shower Set", "quantity": 1, "unit": "set", "cost": 3000, "totalAmount": 3000 }
          ]
        },
        {
          "category": "Septic Tank and Catch Basins",
          "materials": [
            { "item": "8.1", "description": "Excavation", "quantity": 7.5, "unit": "cu.m", "cost": 200, "totalAmount": 1500 },
            { "item": "8.2", "description": "4\" CHB", "quantity": 250, "unit": "pcs", "cost": 8, "totalAmount": 2000 },
            { "item": "8.3", "description": "Cement", "quantity": 12, "unit": "bags", "cost": 200, "totalAmount": 2400 },
            { "item": "8.4", "description": "Sand", "quantity": 1.34, "unit": "cu.m", "cost": 1200, "totalAmount": 1608 },
            { "item": "8.5", "description": "Gravel", "quantity": 0.5, "unit": "cu.m", "cost": 1100, "totalAmount": 550 },
            { "item": "8.6", "description": "10mm x 6m Std. RSB", "quantity": 20, "unit": "pcs", "cost": 140, "totalAmount": 2800 },
            { "item": "8.7", "description": "#16 Tie Wire", "quantity": 0.9, "unit": "kgs", "cost": 12, "totalAmount": 10.8 }
          ]
        }
      ],
      "laborCost": 250000,
      "totalProjectCost": 1000000
    }
  }
  
  
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
