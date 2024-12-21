require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose'); 
const workoutRoutes = require('./routes/workouts'); 
const setRoutes = require('./routes/sets'); 
const routineRoutes = require('./routes/routines'); 
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});
app.use('/api/routines', routineRoutes); 
app.use('/api/routines', workoutRoutes); 
app.use('/api/routines', setRoutes); 
app.use('/api/auth', authRoutes);
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        
        app.listen(process.env.PORT, () => {
            console.log('Connected to db, listening on port', process.env.PORT);
        });
    })
    .catch((error) => {
        console.log('Database connection error:', error);
    });
