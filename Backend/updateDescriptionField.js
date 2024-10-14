require('dotenv').config(); // Load environment variables

const mongoose = require('mongoose');
const Material = require('./models/materialsModel');  // Adjust the path to your Material model

// Connect to MongoDB
const connectDB = async () => {
    console.log('Connecting to MongoDB...'); // Optional debugging line
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process if connection fails
    }
};

// Perform bulk update using Mongoose
const updateDescriptionField = async () => {
    try {
        // Update all documents where `Description` exists and rename the field to `description`
        const result = await Material.updateMany(
            { Description: { $exists: true } },
            { $rename: { "Description": "description" } }
        );
        console.log("Field `Description` has been renamed to `description` successfully.", result);
    } catch (error) {
        console.error("Error renaming field:", error);
    }
};

// Gracefully disconnect from MongoDB
const disconnectDB = async () => {
    try {
        console.log("Waiting a moment before disconnecting...");
        await new Promise(resolve => setTimeout(resolve, 1000));  // Small delay before disconnect
        await mongoose.connection.close(false); // Forcefully close Mongoose connection
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
};

// Connect to the database and then run the update function
const startUpdate = async () => {
    await connectDB(); // Connect to the database
    await updateDescriptionField(); // Then run the update
    await disconnectDB(); // Close the connection after the operation
};

startUpdate(); // Start the process
