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

    if (!first) return emptyFields.push('first');
    if (!last) return emptyFields.push('last');
    if (!age) return emptyFields.push('age');
    if (!experience) return emptyFields.push('experience');
    if (!gender) return emptyFields.push('gender');
    if (!height) return emptyFields.push('height');
    // if (!bmr) return emptyFields.push('bmr');

    if (emptyFields.length > 0) return res.status(400).json({error: 'Please fill in all fields', emptyFields});

    try {
        const profile = await User.create({
            first,
            last,
            age,
            experience,
            gender,
            height,
            bmr
        });
        res.status(200).json(profile);
    } catch(error){
        res.status(400).json({error: error.message});
    }
};

module.exports ={
    getBodyInfo,
    createBody
}
