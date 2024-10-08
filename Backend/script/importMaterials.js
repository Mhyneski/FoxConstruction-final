require('dotenv').config();

const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Material = require('../models/materialsModel'); // Adjust the path as needed

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit process with failure
  }
};

// Function to import materials
const importMaterials = async () => {
  try {
    // Read Excel file
    const workbook = xlsx.readFile('./data/CE-Price-List2.xlsx'); // Adjust the path to the uploaded file
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const materials = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Raw Materials Data:', materials);

    // Find the correct header row
    let headerIndex = -1;
    for (let i = 0; i < materials.length; i++) {
      if (materials[i][0] && materials[i][0].trim() === 'DESCRIPTION') {
        headerIndex = i;
        break;
      }
    }

    // If headers are found, process the data rows
    if (headerIndex !== -1) {
      const headers = materials[headerIndex].map(header => header.trim());
      console.log('Headers:', headers);

      // Get the data rows after the header row
      const dataRows = materials.slice(headerIndex + 1);

      // Transform the data to match the schema
      const transformedMaterials = dataRows.map((item, index) => {
        try {
          // Ensure the row has the necessary data before processing
          if (item[0] && item[2] && item[1] !== undefined) {
            return {
              Description: item[0].trim(),
              unit: item[2].trim(),
              cost: parseFloat(item[1].toString().replace(',', '').trim()) // Convert to string, remove commas and trim
            };
          }
          console.warn(`Skipping row ${index + headerIndex + 1} due to missing data:`, item);
          return null;
        } catch (error) {
          console.error(`Error processing row ${index + headerIndex + 1}:`, item, error);
          return null;
        }
      }).filter(item => item !== null);

      // Log transformed materials
      console.log('Transformed Materials:', transformedMaterials);

      // Insert materials into the database
      await Material.insertMany(transformedMaterials);
      console.log('Materials imported successfully');
    } else {
      console.error('Headers not found in the Excel file');
    }
  } catch (error) {
    console.error('Failed to import materials', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the functions
const run = async () => {
  await connectDB();
  await importMaterials();
};

run();
