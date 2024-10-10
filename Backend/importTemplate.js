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
    "title": "Residential 2-Floor House - Standard",
    "type": "residential",
    "tier": "standard",
    "bom": {
      "totalArea": 200,
      "numFloors": 2,
      "avgFloorHeight": 3,
      "materials": [
        { "item": "1.1", "description": "Site Clearing", "category": "Earthwork", "quantity": 1, "unit": "lot", "unitCost": 20000, "totalAmount": 20000 },
        { "item": "1.2", "description": "Construction Layout and Surveying", "category": "Earthwork", "quantity": 1, "unit": "lot", "unitCost": 20000, "totalAmount": 20000 },
        { "item": "1.3", "description": "Staking/ Batterboard Installation", "category": "Earthwork", "quantity": 1, "unit": "lot", "unitCost": 10000, "totalAmount": 10000 },
        { "item": "1.4", "description": "Excavation for foundation and wall footings", "category": "Earthwork", "quantity": 38.51, "unit": "cu.m", "unitCost": 300, "totalAmount": 11553 },
        { "item": "1.5", "description": "Backfill", "category": "Earthwork", "quantity": 116.074, "unit": "cu.m", "unitCost": 80, "totalAmount": 9285.92 },

        { "item": "2.1.1", "description": "Holcim Cement", "category": "Concrete", "quantity": 421, "unit": "bags", "unitCost": 250, "totalAmount": 105250 },
        { "item": "2.1.2", "description": "Lahar Sand", "category": "Concrete", "quantity": 24.5, "unit": "cu.m", "unitCost": 1500, "totalAmount": 36750 },
        { "item": "2.1.3", "description": "Gravel", "category": "Concrete", "quantity": 41.83, "unit": "cu.m", "unitCost": 1400, "totalAmount": 58562 },

        { "item": "2.2.1", "description": "Pag-asa Steel 16mm x 6m Std. RSB", "category": "Rebars", "quantity": 225, "unit": "pcs", "unitCost": 400, "totalAmount": 90000 },
        { "item": "2.2.2", "description": "Pag-asa Steel 12mm x 6m Std. RSB", "category": "Rebars", "quantity": 227, "unit": "pcs", "unitCost": 250, "totalAmount": 56750 },
        { "item": "2.2.3", "description": "Pag-asa Steel 10mm x 6m Std. RSB", "category": "Rebars", "quantity": 562, "unit": "pcs", "unitCost": 170, "totalAmount": 95540 },
        { "item": "2.2.4", "description": "Pag-asa No. 16 Tie wire", "category": "Rebars", "quantity": 69, "unit": "kgs", "unitCost": 15, "totalAmount": 1035 },

        { "item": "2.3.1", "description": "Eagle Plywood 4' x 8' 1/2\" Ordinary", "category": "Formworks", "quantity": 31, "unit": "shts", "unitCost": 600, "totalAmount": 18600 },
        { "item": "2.3.2", "description": "2\" x 2\" x 8' Coco Lumber", "category": "Formworks", "quantity": 225, "unit": "pcs", "unitCost": 100, "totalAmount": 22500 },
        { "item": "2.3.3", "description": "Common wire nail (Assorted)", "category": "Formworks", "quantity": 3, "unit": "kgs", "unitCost": 70, "totalAmount": 210 },

        { "item": "2.4.1", "description": "2\" x 3\" x 12' Coco Lumber", "category": "Scaffoldings", "quantity": 273, "unit": "pcs", "unitCost": 80, "totalAmount": 21840 },
        { "item": "2.4.2", "description": "2\" x 2\" x 12' Coco Lumber", "category": "Scaffoldings", "quantity": 452, "unit": "pcs", "unitCost": 60, "totalAmount": 27120 },
        { "item": "2.4.3", "description": "Common wire nail (Assorted)", "category": "Scaffoldings", "quantity": 58, "unit": "kgs", "unitCost": 70, "totalAmount": 4060 },

        { "item": "2.5.1", "description": "6\" thk. CHB", "category": "Masonry", "quantity": 2589, "unit": "pcs", "unitCost": 12, "totalAmount": 31068 },
        { "item": "2.5.2", "description": "4\" thk. CHB", "category": "Masonry", "quantity": 1077, "unit": "pcs", "unitCost": 10, "totalAmount": 10770 },
        { "item": "2.5.3", "description": "Holcim Cement", "category": "Masonry", "quantity": 415, "unit": "bags", "unitCost": 250, "totalAmount": 103750 },
        { "item": "2.5.4", "description": "Lahar Sand", "category": "Masonry", "quantity": 30.4, "unit": "cu.m", "unitCost": 800, "totalAmount": 24320 },

        { "item": "3.1.1", "description": "Mariwasa Non-skid floor tile (20cm x 20cm) - *Standard Ceramic Tile*", "category": "Architectural - Tiles", "quantity": 158, "unit": "pcs", "unitCost": 20, "totalAmount": 3160 },
        { "item": "3.1.2", "description": "Mariwasa Toilet Wall Tile (20cm x 20cm) - *Standard Ceramic Tile*", "category": "Architectural - Tiles", "quantity": 473, "unit": "pcs", "unitCost": 20, "totalAmount": 9460 },
        { "item": "3.1.3", "description": "Davies Tile Adhesive - *Standard Quality*", "category": "Architectural - Tiles", "quantity": 3, "unit": "bags", "unitCost": 300, "totalAmount": 900 },
        { "item": "3.1.4", "description": "Davies Tile Grout - *Standard Quality*", "category": "Architectural - Tiles", "quantity": 12, "unit": "bags", "unitCost": 50, "totalAmount": 600 },
        { "item": "3.1.5", "description": "Cement Mortar - *Standard Cement*", "category": "Architectural - Tiles", "quantity": 3, "unit": "bags", "unitCost": 250, "totalAmount": 750 },

        { "item": "3.2.1", "description": "Boysen Masonry Neutralizer", "category": "Architectural - Painting", "quantity": 25, "unit": "gal", "unitCost": 150, "totalAmount": 3750 },
        { "item": "3.2.2", "description": "Boysen Acrylic Gloss Latex", "category": "Architectural - Painting", "quantity": 39, "unit": "gal", "unitCost": 450, "totalAmount": 17550 },
        { "item": "3.2.3", "description": "Boysen Latex Colors - *Standard Color Palette*", "category": "Architectural - Painting", "quantity": 156, "unit": "liters", "unitCost": 150, "totalAmount": 23400 },
        { "item": "3.2.4", "description": "Paint Rollers & Trays  - *Standard Tools*", "category": "Architectural - Painting", "quantity": 8, "unit": "pcs", "unitCost": 200, "totalAmount": 1600 },
        { "item": "3.2.5", "description": "Paint Brush - *Standard Quality*", "category": "Architectural - Painting", "quantity": 5, "unit": "pcs", "unitCost": 50, "totalAmount": 250 },
        { "item": "3.2.6", "description": "Painters Tape", "category": "Architectural - Painting", "quantity": 4, "unit": "pcs", "unitCost": 100, "totalAmount": 400 },
        { "item": "3.2.7", "description": "Rags", "category": "Architectural - Painting", "quantity": 20, "unit": "pcs", "unitCost": 5, "totalAmount": 100 },
        { "item": "3.2.8", "description": "Drop Cloth", "category": "Architectural - Painting", "quantity": 4, "unit": "pcs", "unitCost": 150, "totalAmount": 600 },
        { "item": "3.2.9", "description": "Miscellaneous - *Standard Supplies*", "category": "Architectural - Painting", "quantity": 1, "unit": "lot", "unitCost": 3000, "totalAmount": 3000 },

        { "item": "4.1", "description": "Trusses and Purlins", "category": "Roofing", "quantity": 1, "unit": "lot", "unitCost": 120000, "totalAmount": 120000 },
        { "item": "4.2.1", "description": "Steeltech Pre-painted Metal Roof", "category": "Roofing", "quantity": 20, "unit": "sheets", "unitCost": 1200, "totalAmount": 24000 },
        { "item": "4.2.2", "description": "Steeltech Pre-painted Gutter", "category": "Roofing", "quantity": 8, "unit": "pcs", "unitCost": 350, "totalAmount": 2800 },
        { "item": "4.2.3", "description": "Steeltech End Flashing", "category": "Roofing", "quantity": 8, "unit": "pcs", "unitCost": 350, "totalAmount": 2800 },
        { "item": "4.2.4", "description": "Tekscrew - *Standard Quality*", "category": "Roofing", "quantity": 9, "unit": "kgs", "unitCost": 250, "totalAmount": 2250 },
        { "item": "4.2.5", "description": "Hipped Roll", "category": "Roofing", "quantity": 10, "unit": "pcs", "unitCost": 250, "totalAmount": 2500 },

        { "item": "5.1.1", "description": "Solid Wooden Panel Door, Jamb and Accessories - *Standard Quality Wood*", "category": "Doors and Windows", "quantity": 1, "unit": "set", "unitCost": 5000, "totalAmount": 5000 },
        { "item": "5.1.2", "description": "Fabricated Flush Door, Jamb and Accessories - *Standard Quality Plywood*", "category": "Doors and Windows", "quantity": 5, "unit": "set", "unitCost": 3000, "totalAmount": 15000 },
        { "item": "5.1.3", "description": "Polyvinyl Chloride Door with Louver, Jamb and Accessories", "category": "Doors and Windows", "quantity": 1, "unit": "set", "unitCost": 1500, "totalAmount": 1500 },
        { "item": "5.1.4", "description": "Aluminum Sliding Door and Accessories - *Standard Quality Aluminum*", "category": "Doors and Windows", "quantity": 1, "unit": "set", "unitCost": 15000, "totalAmount": 15000 },
        { "item": "5.2.1", "description": "1.4m x 1.2m (H) Aluminum Sliding Window", "category": "Doors and Windows", "quantity": 1, "unit": "set", "unitCost": 10000, "totalAmount": 10000 },
        { "item": "5.2.2", "description": "1.5m x 0.5m (H) Aluminum Awning Window", "category": "Doors and Windows", "quantity": 1, "unit": "set", "unitCost": 1500, "totalAmount": 1500 },
        { "item": "5.2.3", "description": "1.6m x 1.2m (H) Aluminum Sliding Window", "category": "Doors and Windows", "quantity": 6, "unit": "set", "unitCost": 12000, "totalAmount": 72000 },
        { "item": "5.2.4", "description": "0.5m x 0.5m (H) Aluminum Awning Window", "category": "Doors and Windows", "quantity": 1, "unit": "set", "unitCost": 500, "totalAmount": 500 },

        { "item": "6.1.1", "description": "Firefly 20 Watts LED Circular Lamp with Glass Cover", "category": "Electrical", "quantity": 8, "unit": "pcs", "unitCost": 1200, "totalAmount": 9600 },
        { "item": "6.1.2", "description": "Firefly 10 Watts LED Pin Light with Housing", "category": "Electrical", "quantity": 6, "unit": "pcs", "unitCost": 350, "totalAmount": 2100 },
        { "item": "6.1.3", "description": "Royu Duplex Convenient Outlet", "category": "Electrical", "quantity": 12, "unit": "pcs", "unitCost": 200, "totalAmount": 2400 },
        { "item": "6.1.4", "description": "Royu Single Gang Switch w/ plate & cover", "category": "Electrical", "quantity": 6, "unit": "pcs", "unitCost": 150, "totalAmount": 900 },
        { "item": "6.1.5", "description": "Royu Two Gang Switch w/ plate & cover", "category": "Electrical", "quantity": 4, "unit": "pcs", "unitCost": 200, "totalAmount": 800 },
        { "item": "6.2.1", "description": "Phelps Dodge 2.0mm² THHN Stranded Wire", "category": "Electrical", "quantity": 115.5, "unit": "m", "unitCost": 20, "totalAmount": 2310 },
        { "item": "6.2.2", "description": "½\" x 3m Emerald PVC Pipe Conduit", "category": "Electrical", "quantity": 21, "unit": "pcs", "unitCost": 60, "totalAmount": 1260 },
        { "item": "6.2.3", "description": "1.5\" x 10 ft RSC Pipe", "category": "Electrical", "quantity": 1, "unit": "pcs", "unitCost": 700, "totalAmount": 700 },
        { "item": "6.2.4", "description": "1.5\" Entrance Cap", "category": "Electrical", "quantity": 1, "unit": "pcs", "unitCost": 200, "totalAmount": 200 },
        { "item": "6.2.5", "description": "½\" x 90° Long Elbow", "category": "Electrical", "quantity": 4, "unit": "pcs", "unitCost": 25, "totalAmount": 100 },
        { "item": "6.2.6", "description": "Electrical Tape", "category": "Electrical", "quantity": 7, "unit": "pcs", "unitCost": 70, "totalAmount": 490 },
        { "item": "6.2.7", "description": "4\" x 4\" Emerald PVC Junction Box w/ Cover", "category": "Electrical", "quantity": 14, "unit": "pcs", "unitCost": 50, "totalAmount": 700 },
        { "item": "6.2.8", "description": "2\" x 4\" Utility Box", "category": "Electrical", "quantity": 14, "unit": "pcs", "unitCost": 50, "totalAmount": 700 },
        { "item": "6.3", "description": "Power Panel", "category": "Electrical", "quantity": 1, "unit": "lot", "unitCost": 7000, "totalAmount": 7000 },
        { "item": "6.4", "description": "Power Supply Connectom", "category": "Electrical", "quantity": 1, "unit": "lot", "unitCost": 15000, "totalAmount": 15000 },

        { "item": "7.1", "description": "100mm Diameter Atlanta PVC Pipe", "category": "Plumbing", "quantity": 20, "unit": "L-m", "unitCost": 120, "totalAmount": 2400 },
        { "item": "7.2", "description": "100mm Diameter Atlanta Wye", "category": "Plumbing", "quantity": 1, "unit": "pcs", "unitCost": 100, "totalAmount": 100 },
        { "item": "7.3", "description": "100mm Diameter Atlanta U-Fitting", "category": "Plumbing", "quantity": 1, "unit": "pcs", "unitCost": 250, "totalAmount": 250 },
        { "item": "7.4", "description": "100mm Diameter Atlanta Floor Drain", "category": "Plumbing", "quantity": 1, "unit": "pcs", "unitCost": 250, "totalAmount": 250 },
        { "item": "7.5", "description": "100mm Diameter Atlanta Floor Clean Out", "category": "Plumbing", "quantity": 2, "unit": "pcs", "unitCost": 35, "totalAmount": 70 },
        { "item": "7.6", "description": "75mm Diameter Atlanta PVC Pipe", "category": "Plumbing", "quantity": 55, "unit": "L-m", "unitCost": 100, "totalAmount": 5500 },
        { "item": "7.7", "description": "75mm Diameter Atlanta Wye", "category": "Plumbing", "quantity": 5, "unit": "pcs", "unitCost": 80, "totalAmount": 400 },
        { "item": "7.8", "description": "75mm Diameter Atlanta Elbow", "category": "Plumbing", "quantity": 4, "unit": "pcs", "unitCost": 90, "totalAmount": 360 },
        { "item": "7.9", "description": "50mm Diameter Atlanta PVC Pipe", "category": "Plumbing", "quantity": 12, "unit": "L-m", "unitCost": 80, "totalAmount": 960 },
        { "item": "7.10", "description": "Atlanta 50mm Diameter U-Trap", "category": "Plumbing", "quantity": 3, "unit": "pcs", "unitCost": 250, "totalAmount": 750 },
        { "item": "7.11", "description": "Atlanta 50mm Diameter Elbow", "category": "Plumbing", "quantity": 10, "unit": "pcs", "unitCost": 40, "totalAmount": 400 },
        { "item": "7.12", "description": "Atlanta 20mm Diameter PVC Pipe", "category": "Plumbing", "quantity": 30, "unit": "L-m", "unitCost": 50, "totalAmount": 1500 },
        { "item": "7.13", "description": "Atlanta 20mm Diameter Elbow", "category": "Plumbing", "quantity": 16, "unit": "pcs", "unitCost": 50, "totalAmount": 800 },
        { "item": "7.14", "description": "Atlanta 20mm Diameter Tee", "category": "Plumbing", "quantity": 2, "unit": "pcs", "unitCost": 50, "totalAmount": 100 },
        { "item": "7.15", "description": "Atlanta 20mm Diameter Gate Valve", "category": "Plumbing", "quantity": 1, "unit": "pcs", "unitCost": 500, "totalAmount": 500 },
        { "item": "7.16", "description": "HCG Water Closet Flush Type", "category": "Plumbing", "quantity": 1, "unit": "set", "unitCost": 6000, "totalAmount": 6000 },
        { "item": "7.17", "description": "HCG Lavatory", "category": "Plumbing", "quantity": 1, "unit": "pcs", "unitCost": 6000, "totalAmount": 6000 },
        { "item": "7.18", "description": "Atlanta Faucet", "category": "Plumbing", "quantity": 3, "unit": "pcs", "unitCost": 200, "totalAmount": 600 },
        { "item": "7.19", "description": "Atlanta Water Meter", "category": "Plumbing", "quantity": 1, "unit": "pcs", "unitCost": 1500, "totalAmount": 1500 },
        { "item": "7.20", "description": "HCG Kitchen Sink", "category": "Plumbing", "quantity": 1, "unit": "pcs", "unitCost": 500, "totalAmount": 500 },
        { "item": "7.21", "description": "HCG Shower Set", "category": "Plumbing", "quantity": 1, "unit": "set", "unitCost": 4000, "totalAmount": 4000 },

        { "item": "8.1", "description": "Excavation", "category": "Septic Tank and Catch Basins", "quantity": 7.5, "unit": "cu.m", "unitCost": 250, "totalAmount": 1875 },
        { "item": "8.2", "description": "4\" CHB", "category": "Septic Tank and Catch Basins", "quantity": 250, "unit": "pcs", "unitCost": 12, "totalAmount": 3000 },
        { "item": "8.3", "description": "Holcim Cement", "category": "Septic Tank and Catch Basins", "quantity": 12, "unit": "bags", "unitCost": 250, "totalAmount": 3000 },
        { "item": "8.4", "description": "Lahar Sand", "category": "Septic Tank and Catch Basins", "quantity": 1.34, "unit": "cu.m", "unitCost": 1500, "totalAmount": 2010 },
        { "item": "8.5", "description": "Gravel", "category": "Septic Tank and Catch Basins", "quantity": 0.5, "unit": "cu.m", "unitCost": 1400, "totalAmount": 700 },
        { "item": "8.6", "description": "Pag-asa Steel 10mm x 6m Std. RSB", "category": "Septic Tank and Catch Basins", "quantity": 20, "unit": "pcs", "unitCost": 170, "totalAmount": 3400 },
        { "item": "8.7", "description": "#16 Tie Wire", "category": "Septic Tank and Catch Basins", "quantity": 0.9, "unit": "kgs", "unitCost": 15, "totalAmount": 13.5 }
      ],
      "laborCost": 300000,
      "totalProjectCost": 1300000
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
