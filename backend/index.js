require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');
const request = require('request'); 
const workoutRoutes = require('./routes/workouts'); 
const setRoutes = require('./routes/sets'); 
const routineRoutes = require('./routes/routines'); 
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const corsOptions = {
    origin: ["https://brawnapp.onrender.com","http://localhost:3000"],
    methods: 'GET, POST, PUT, DELETE, PATCH',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});


app.use('/proxy/*', (req, res) => {
    const baseTargetUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://brawn-tedx.onrender.com'
            : 'http://localhost:4000';

    const targetUrl = `${baseTargetUrl}${req.originalUrl.replace('/proxy', '')}`;

    const options = {
        url: targetUrl,
        method: req.method, 
        headers: req.headers,
        body: req.body, 
        json: true, 
    };

    request(options, (error, response, body) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to proxy request', details: error.message });
        }
        res.status(response.statusCode).send(body); 
    });
});


app.use('/api/routines', routineRoutes); 
app.use('/api/routines', workoutRoutes); 
app.use('/api/routines', setRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get("/", (req, res) => {
    res.status(201).json({ message: "Connected to Backend!" });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Connected to db, listening on port', process.env.PORT);
        });
    })
    .catch((error) => {
        console.log('Database connection error:', error);
    });
