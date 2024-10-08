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
    title: 'Residential 2-Floor House',
    type: 'residential',
    tier: 'mid', // Change to 'low', 'mid', or 'high' as needed
    bom: {
      totalArea: 200,  // Updated to recommended value in square meters
      numFloors: 2,
      avgFloorHeight: 3,  // Updated to recommended value in meters
      materials: [
        // Site Preparation and Earthworks
        { item: '1.1', description: 'Site Clearing', category: 'Earthwork', quantity: 1, unit: 'lot', unitCost: 20000, totalAmount: 20000 },
        { item: '1.2', description: 'Construction Layout and Surveying', category: 'Earthwork', quantity: 1, unit: 'lot', unitCost: 20000, totalAmount: 20000 },
        { item: '1.3', description: 'Staking/ Batterboard Installation', category: 'Earthwork', quantity: 1, unit: 'lot', unitCost: 10000, totalAmount: 10000 },
        { item: '1.4', description: 'Excavation for foundation and wall footings', category: 'Earthwork', quantity: 38.51, unit: 'cu.m', unitCost: 250, totalAmount: 9627.5 },
        { item: '1.5', description: 'Backfill', category: 'Earthwork', quantity: 116.074, unit: 'cu.m', unitCost: 80, totalAmount: 9285.888 },

        // Structural Works - Concrete
        { item: '2.1.1', description: 'Cement', category: 'Concrete', quantity: 421, unit: 'bags', unitCost: 259, totalAmount: 109039 },
        { item: '2.1.2', description: 'Sand', category: 'Concrete', quantity: 24.5, unit: 'cu.m', unitCost: 1435, totalAmount: 35157.5 },
        { item: '2.1.3', description: 'Gravel', category: 'Concrete', quantity: 41.83, unit: 'cu.m', unitCost: 1310, totalAmount: 54797.3 },

        // Structural Works - Rebars
        { item: '2.2.1', description: '16mm x 6m Std. RSB', category: 'Rebars', quantity: 225, unit: 'pcs', unitCost: 392, totalAmount: 88200 },
        { item: '2.2.2', description: '12mm x 6m Std. RSB', category: 'Rebars', quantity: 227, unit: 'pcs', unitCost: 221, totalAmount: 50167 },
        { item: '2.2.3', description: '10mm x 6m Std. RSB', category: 'Rebars', quantity: 562, unit: 'pcs', unitCost: 156, totalAmount: 87672 },
        { item: '2.2.4', description: 'No. 16 Tie wire', category: 'Rebars', quantity: 69, unit: 'kgs', unitCost: 16, totalAmount: 1104 },

        // Structural Works - Formworks
        { item: '2.3.1', description: "4' x 8' 1/2\" Ordinary plywood", category: 'Formworks', quantity: 31, unit: 'shts', unitCost: 656, totalAmount: 20336 },
        { item: '2.3.2', description: "2\" x 2\" x 8' Coco Lumber", category: 'Formworks', quantity: 225, unit: 'pcs', unitCost: 95, totalAmount: 21375 },
        { item: '2.3.3', description: 'Common wire nail (Assorted)', category: 'Formworks', quantity: 3, unit: 'kgs', unitCost: 75, totalAmount: 225 },

        // Structural Works - Scaffoldings
        { item: '2.4.1', description: "2\" x 3\" x 12' Coco Lumber", category: 'Scaffoldings', quantity: 273, unit: 'pcs', unitCost: 72, totalAmount: 19656 },
        { item: '2.4.2', description: "2\" x 2\" x 12' Coco Lumber", category: 'Scaffoldings', quantity: 452, unit: 'pcs', unitCost: 48, totalAmount: 21696 },
        { item: '2.4.3', description: 'Common wire nail (Assorted)', category: 'Scaffoldings', quantity: 58, unit: 'kgs', unitCost: 68, totalAmount: 3944 },

        // Masonry Works
        { item: '2.5.1', description: '6" thk. CHB', category: 'Masonry', quantity: 2589, unit: 'pcs', unitCost: 12, totalAmount: 31068 },
        { item: '2.5.2', description: '4" thk. CHB', category: 'Masonry', quantity: 1077, unit: 'pcs', unitCost: 10, totalAmount: 10770 },
        { item: '2.5.3', description: 'Cement', category: 'Masonry', quantity: 415, unit: 'bags', unitCost: 260, totalAmount: 107900 },
        { item: '2.5.4', description: 'Sand', category: 'Masonry', quantity: 30.4, unit: 'cu.m', unitCost: 800, totalAmount: 24320 },

        // Architectural Works - Toilet Tiles
        { item: '3.1.1', description: 'Non-skid floor tile (20cm x 20cm) - *Enhanced Ceramic Tile*', category: 'Architectural - Tiles', quantity: 158, unit: 'pcs', unitCost: 17, totalAmount: 2686 },
        { item: '3.1.2', description: 'Toilet Wall Tile (20cm x 20cm) - *Varied Designs Ceramic Tile*', category: 'Architectural - Tiles', quantity: 473, unit: 'pcs', unitCost: 17, totalAmount: 8041 },
        { item: '3.1.3', description: 'Tile Adhesive - *Mid-Range Quality*', category: 'Architectural - Tiles', quantity: 3, unit: 'bags', unitCost: 250, totalAmount: 750 },
        { item: '3.1.4', description: 'Tile Grout - *Mid-Range Quality*', category: 'Architectural - Tiles', quantity: 12, unit: 'bags', unitCost: 45, totalAmount: 540 },
        { item: '3.1.5', description: 'Cement Mortar - *Standard Cement*', category: 'Architectural - Tiles', quantity: 3, unit: 'bags', unitCost: 259, totalAmount: 777 },

        // Architectural Works - Painting
        { item: '3.2.1', description: 'Masonry Neutralizer - *Mid-Range Brand*', category: 'Architectural - Painting', quantity: 25, unit: 'gal', unitCost: 175, totalAmount: 4375 },
        { item: '3.2.2', description: 'Acrylic Gloss Latex - *Mid-Grade Paint*', category: 'Architectural - Painting', quantity: 39, unit: 'gal', unitCost: 460, totalAmount: 17940 },
        { item: '3.2.3', description: 'Latex Colors - *Expanded Color Palette*', category: 'Architectural - Painting', quantity: 156, unit: 'liters', unitCost: 150, totalAmount: 23400 },
        { item: '3.2.4', description: 'Paint Rollers & Trays  - *Mid-Range Tools*', category: 'Architectural - Painting', quantity: 8, unit: 'pcs', unitCost: 200, totalAmount: 1600 },
        { item: '3.2.5', description: 'Paint Brush - *Better Quality*', category: 'Architectural - Painting', quantity: 5, unit: 'pcs', unitCost: 50, totalAmount: 250 },
        { item: '3.2.6', description: 'Painters Tape - *Mid-Range Tape*', category: 'Architectural - Painting', quantity: 4, unit: 'pcs', unitCost: 100, totalAmount: 400 },
        { item: '3.2.7', description: 'Rags - *Mid-Range Quality*', category: 'Architectural - Painting', quantity: 20, unit: 'pcs', unitCost: 3, totalAmount: 60 },
        { item: '3.2.8', description: 'Drop Cloth - *Mid-Range Cloth*', category: 'Architectural - Painting', quantity: 4, unit: 'pcs', unitCost: 150, totalAmount: 600 },
        { item: '3.2.9', description: 'Miscellaneous - *Mid-Range Supplies*', category: 'Architectural - Painting', quantity: 1, unit: 'lot', unitCost: 3000, totalAmount: 3000 },

        // Roofing Works
        { item: '4.1', description: 'Trusses and Purlins', category: 'Roofing', quantity: 1, unit: 'lot', unitCost: 135000, totalAmount: 135000 },
        { item: '4.2.1', description: 'Pre-painted Metal Roof - *Thicker Gauge Metal*', category: 'Roofing', quantity: 20, unit: 'sheets', unitCost: 1200, totalAmount: 24000 },
        { item: '4.2.2', description: 'Pre-painted Gutter - *Mid-Range Gutter*', category: 'Roofing', quantity: 8, unit: 'pcs', unitCost: 305, totalAmount: 2440 },
        { item: '4.2.3', description: 'End Flashing - *Mid-Range Flashing*', category: 'Roofing', quantity: 8, unit: 'pcs', unitCost: 323, totalAmount: 2584 },
        { item: '4.2.4', description: 'Tekscrew - *Mid-Range Quality*', category: 'Roofing', quantity: 9, unit: 'kgs', unitCost: 250, totalAmount: 2250 },
        { item: '4.2.5', description: 'Hipped Roll - *Mid-Range Quality*', category: 'Roofing', quantity: 10, unit: 'pcs', unitCost: 261, totalAmount: 2610 },

        // Doors and Windows
        { item: '5.1.1', description: 'Solid Wooden Panel Door, Jamb and Accessories - *Solid Wood with Simple Design*', category: 'Doors and Windows', quantity: 1, unit: 'set', unitCost: 5000, totalAmount: 5000 },
        { item: '5.1.2', description: 'Fabricated Flush Door, Jamb and Accessories - *Better Quality Plywood*', category: 'Doors and Windows', quantity: 5, unit: 'set', unitCost: 3500, totalAmount: 17500 },
        { item: '5.1.3', description: 'Polyvinyl Chloride Door with Louver, Jamb and Accessories - *Mid-Range PVC*', category: 'Doors and Windows', quantity: 1, unit: 'set', unitCost: 1500, totalAmount: 1500 },
        { item: '5.1.4', description: 'Aluminum Sliding Door and Accessories - *Powder-Coated Aluminum*', category: 'Doors and Windows', quantity: 1, unit: 'set', unitCost: 15000, totalAmount: 15000 },
        { item: '5.2.1', description: '1.4m x 1.2m (H) Aluminum Sliding Window - *Powder-Coated Aluminum*', category: 'Doors and Windows', quantity: 1, unit: 'set', unitCost: 9899.35, totalAmount: 9899.35 },
        { item: '5.2.2', description: '1.5m x 0.5m (H) Aluminum Awning Window - *Mid-Range Quality*', category: 'Doors and Windows', quantity: 1, unit: 'set', unitCost: 1479, totalAmount: 1479 },
        { item: '5.2.3', description: '1.6m x 1.2m (H) Aluminum Sliding Window - *Powder-Coated Aluminum*', category: 'Doors and Windows', quantity: 6, unit: 'set', unitCost: 11306.9, totalAmount: 67841.28 },
        { item: '5.2.4', description: '0.5m x 0.5m (H) Aluminum Awning Window - *Mid-Range Quality*', category: 'Doors and Windows', quantity: 1, unit: 'set', unitCost: 493, totalAmount: 493 },

        // Electrical Works
        { item: '6.1.1', description: '20 Watts LED Circular Lamp with Glass Cover', category: 'Electrical', quantity: 8, unit: 'pcs', unitCost: 1450, totalAmount: 11600 },
        { item: '6.1.2', description: '10 Watts LED Pin Light with Housing', category: 'Electrical', quantity: 6, unit: 'pcs', unitCost: 380, totalAmount: 2280 },
        { item: '6.1.3', description: 'Duplex Convenient Outlet', category: 'Electrical', quantity: 12, unit: 'pcs', unitCost: 180, totalAmount: 2160 },
        { item: '6.1.4', description: 'Single Gang Switch w/ plate & cover', category: 'Electrical', quantity: 6, unit: 'pcs', unitCost: 140, totalAmount: 840 },
        { item: '6.1.5', description: 'Two Gang Switch w/ plate & cover', category: 'Electrical', quantity: 4, unit: 'pcs', unitCost: 180, totalAmount: 720 },
        { item: '6.2.1', description: '2.0mm² THHN Stranded Wire', category: 'Electrical', quantity: 115.5, unit: 'm', unitCost: 18, totalAmount: 2079 },
        { item: '6.2.2', description: '½" x 3m PVC Pipe Conduit', category: 'Electrical', quantity: 21, unit: 'pcs', unitCost: 58.14, totalAmount: 1220.94 },
        { item: '6.2.3', description: '1.5" x 10 ft RSC Pipe', category: 'Electrical', quantity: 1, unit: 'pcs', unitCost: 560, totalAmount: 560 },
        { item: '6.2.4', description: '1.5" Entrance Cap', category: 'Electrical', quantity: 1, unit: 'pcs', unitCost: 160, totalAmount: 160 },
        { item: '6.2.5', description: '½" x 90° Long Elbow', category: 'Electrical', quantity: 4, unit: 'pcs', unitCost: 25, totalAmount: 100 },
        { item: '6.2.6', description: 'Electrical Tape', category: 'Electrical', quantity: 7, unit: 'pcs', unitCost: 65, totalAmount: 455 },
        { item: '6.2.7', description: '4" x 4" PVC Junction Box w/ Cover', category: 'Electrical', quantity: 14, unit: 'pcs', unitCost: 45, totalAmount: 630 },
        { item: '6.2.8', description: '2" x 4" Utility Box', category: 'Electrical', quantity: 14, unit: 'pcs', unitCost: 45, totalAmount: 630 },
        { item: '6.3', description: 'Power Panel', category: 'Electrical', quantity: 1, unit: 'lot', unitCost: 7500, totalAmount: 7500 },
        { item: '6.4', description: 'Power Supply Connectom', category: 'Electrical', quantity: 1, unit: 'lot', unitCost: 18000, totalAmount: 18000 },

        // Plumbing Works
        { item: '7.1', description: '100mm Diameter PVC Pipe', category: 'Plumbing', quantity: 20, unit: 'L-m', unitCost: 126.48, totalAmount: 2529.6 },
        { item: '7.2', description: '100mm Diameter Wye', category: 'Plumbing', quantity: 1, unit: 'pcs', unitCost: 97, totalAmount: 97 },
        { item: '7.3', description: '100mm Diameter U-Fitting', category: 'Plumbing', quantity: 1, unit: 'pcs', unitCost: 272.95, totalAmount: 272.95 },
        { item: '7.4', description: '100mm Diameter Floor Drain', category: 'Plumbing', quantity: 1, unit: 'pcs', unitCost: 285, totalAmount: 285 },
        { item: '7.5', description: '100mm Diameter Floor Clean Out', category: 'Plumbing', quantity: 2, unit: 'pcs', unitCost: 35.02, totalAmount: 70.04 },
        { item: '7.6', description: '75mm Diameter PVC Pipe', category: 'Plumbing', quantity: 55, unit: 'L-m', unitCost: 81.29, totalAmount: 4470.95 },
        { item: '7.7', description: '75mm Diameter Wye', category: 'Plumbing', quantity: 5, unit: 'pcs', unitCost: 83.75, totalAmount: 418.75 },
        { item: '7.8', description: '75mm Diameter Elbow', category: 'Plumbing', quantity: 4, unit: 'pcs', unitCost: 87, totalAmount: 348 },
        { item: '7.9', description: '50mm Diameter PVC Pipe', category: 'Plumbing', quantity: 12, unit: 'L-m', unitCost: 76.3, totalAmount: 915.6 },
        { item: '7.10', description: '50mm Diameter U-Trap', category: 'Plumbing', quantity: 3, unit: 'pcs', unitCost: 272.95, totalAmount: 818.85 },
        { item: '7.11', description: '50mm Diameter Elbow', category: 'Plumbing', quantity: 10, unit: 'pcs', unitCost: 31, totalAmount: 310 },
        { item: '7.12', description: '20mm Diameter PVC Pipe', category: 'Plumbing', quantity: 30, unit: 'L-m', unitCost: 42, totalAmount: 1260 },
        { item: '7.13', description: '20mm Diameter Elbow', category: 'Plumbing', quantity: 16, unit: 'pcs', unitCost: 37, totalAmount: 592 },
        { item: '7.14', description: '20mm Diameter Tee', category: 'Plumbing', quantity: 2, unit: 'pcs', unitCost: 35, totalAmount: 70 },
        { item: '7.15', description: '20mm Diameter Gate Valve', category: 'Plumbing', quantity: 1, unit: 'pcs', unitCost: 394, totalAmount: 394 },
        { item: '7.16', description: 'Water Closet Flush Type', category: 'Plumbing', quantity: 1, unit: 'set', unitCost: 6680, totalAmount: 6680 },
        { item: '7.17', description: 'Lavatory', category: 'Plumbing', quantity: 1, unit: 'pcs', unitCost: 6680, totalAmount: 6680 },
        { item: '7.18', description: 'Faucet', category: 'Plumbing', quantity: 3, unit: 'pcs', unitCost: 178, totalAmount: 534 },
        { item: '7.19', description: 'Water Meter', category: 'Plumbing', quantity: 1, unit: 'pcs', unitCost: 1690, totalAmount: 1690 },
        { item: '7.20', description: 'Kitchen Sink', category: 'Plumbing', quantity: 1, unit: 'pcs', unitCost: 552, totalAmount: 552 },
        { item: '7.21', description: 'Shower Set', category: 'Plumbing', quantity: 1, unit: 'set', unitCost: 5000, totalAmount: 5000 },

        // Septic Tank and Catch Basins
        { item: '8.1', description: 'Excavation', category: 'Septic Tank and Catch Basins', quantity: 7.5, unit: 'cu.m', unitCost: 250, totalAmount: 1875 },
        { item: '8.2', description: '4" CHB', category: 'Septic Tank and Catch Basins', quantity: 250, unit: 'pcs', unitCost: 10, totalAmount: 2500 },
        { item: '8.3', description: 'Cement', category: 'Septic Tank and Catch Basins', quantity: 12, unit: 'bags', unitCost: 259, totalAmount: 3108 },
        { item: '8.4', description: 'Sand', category: 'Septic Tank and Catch Basins', quantity: 1.34, unit: 'cu.m', unitCost: 1435, totalAmount: 1922.9 },
        { item: '8.5', description: 'Gravel', category: 'Septic Tank and Catch Basins', quantity: 0.5, unit: 'cu.m', unitCost: 1310, totalAmount: 655 },
        { item: '8.6', description: '10mm x 6m Std. RSB', category: 'Septic Tank and Catch Basins', quantity: 20, unit: 'pcs', unitCost: 156, totalAmount: 3120 },
        { item: '8.7', description: '#16 Tie Wire', category: 'Septic Tank and Catch Basins', quantity: 0.9, unit: 'kgs', unitCost: 16, totalAmount: 14.4 },
      ],
      laborCost: 361342.44,
      totalProjectCost: 1565817.2
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
