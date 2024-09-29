require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose'); // ODM library for MongoDB
const workoutRoutes = require('./routes/workouts'); // Import workout routes
const setRoutes = require('./routes/sets'); // Import sets routes
const routineRoutes = require('./routes/routines'); // Import routine routes
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth');

// Create an Express app
const app = express();
app.use(express.json());

// Middleware to parse JSON bodies
app.use(express.json());

// app.use(cors({
//     origin:["http://localhost:4000"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
// }));
app.use(cors());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// Register the routine routes with the app
app.use('/api/routines', routineRoutes); // New route for routines

// Register the workout routes with the app (nested under routines)
app.use('/api/routines', workoutRoutes); // Workout routes under routines

// Register the set routes with the app (nested under workouts)
app.use('/api/routines', setRoutes); // Set routes under workouts

//initializing authentication route
app.use('/api/auth', authRoutes);

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // Start the server once connected to the database
        app.listen(process.env.PORT, () => {
            console.log('Connected to db, listening on port', process.env.PORT);
        });
    })
    .catch((error) => {
        console.log('Database connection error:', error);
    });
