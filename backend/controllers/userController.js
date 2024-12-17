const User = require('../models/User');
const mongoose = require('mongoose');

const getBodyInfo = async (req, res) =>{
    const userID = req.user.id;

    if(!mongoose.Types.ObjectId.isValid(userID)) return res.status(404).json({error: 'no such user'});

    const body = await User.findOne({user: userID});

    if (!body) return res.status(404).json({error: 'Body doesn\'t exist'});

    res.status(200).json({
        First: user.FirstName,
        Last: user.LastName,
        Age: user.Age,
        Experience: user.YearsOfWorkoutExperience,
        Gender: user.Gender,
        Height: user.Height,
        BMR: user.BMR
    });   
};

const createBody = async (req, res) =>{
    const userID = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userID)) return res.status(404).json({error: 'no such user'});
    
    const {first, last, age, experience, gender, height, bmr} = req.body;
    
    var emptyFields = [];
    




}
