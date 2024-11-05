require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const materialRoutes = require('./routes/materialsRoute');
const locationRoutes = require('./routes/locationsRoute');
const templatesRoutes = require('./routes/templatesRoute');
const bomRoutes = require('./routes/bomRoute');
const userRoutes = require('./routes/usersRoute');
const projectRoutes = require('./routes/projectRoute');
const { authMiddleware, authorizeRoles } = require('./middlewares/authMiddleware');
const cors = require('cors');
const cron = require('node-cron'); // Import cron
const Project = require('./models/projectModel'); // Import the Project model

// express app
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Enable CORS
app.use(cors({
  origin: 'https://foxconstruction.netlify.app', // Your frontend URL
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 200, // For legacy browsers (IE11, etc.) that handle preflight requests incorrectly
}));

// Apply authMiddleware and authorizeRoles only for protected routes

// No auth required for login and signup routes
app.use('/api/user', userRoutes); // These routes handle login/signup, so no auth middleware here

// Protected routes
app.use('/api/materials', authMiddleware, authorizeRoles(['contractor', 'admin', 'user']), materialRoutes);
app.use('/api/locations', authMiddleware, authorizeRoles(['contractor', 'admin', 'user']), locationRoutes);
app.use('/api/templates', authMiddleware, authorizeRoles(['contractor', 'admin']), templatesRoutes);
app.use('/api/bom', authMiddleware, authorizeRoles(['contractor', 'admin']), bomRoutes);
app.use('/api/project', authMiddleware, authorizeRoles(['contractor', 'admin', 'user']), projectRoutes);

// Function to calculate and update project progress
const updateDailyProgress = async () => {
  try {
    const ongoingProjects = await Project.find({ status: 'ongoing' });
    console.log(`Found ${ongoingProjects.length} ongoing projects to update.`);

    for (const project of ongoingProjects) {
      console.log(`Updating progress for project: ${project.name}`);

      // Recalculate progress using the `applyHybridProgress` method
      project.applyHybridProgress();
      await project.save();

      console.log(`Updated progress for project "${project.name}" to ${project.progress}%`);
    }

    console.log("All ongoing projects have been updated successfully.");
  } catch (error) {
    console.error("Error updating project progress:", error);
  }
};


// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log('Connected to DB and listening on ' + process.env.PORT);
      

      // Schedule the job to run every day at midnight
      cron.schedule('0 0 * * *', () => {
        console.log("Running daily project progress update...");
        updateDailyProgress();
      }, {
        timezone: "Asia/Manila" // Set the timezone as per your requirements
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });
