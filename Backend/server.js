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
  origin: 'https://foxconsturctionsite.netlify.app', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log('Connected to DB and listening on ' + process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
