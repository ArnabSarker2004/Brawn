const User = require('../models/User');
const mongoose = require('mongoose');

const getBodyInfo = async (req, res) =>{
    const userID = req.body.username;
    const body = await User.findOne({username: userID});
    if (!body) return res.status(404).json({error: 'Body doesn\'t exist'});

    res.status(200).json({
        Name: body.Name,
        Email:body.Email,
        Age: body.Age,
        Experience: body.YearsOfWorkoutExperience,
        Gender: body.Gender,
        Height: body.Height,
        Weight: body.Weight,
        BMR: body.BMR,
        YearsOfWorkoutExperience: body.YearsOfWorkoutExperience,
        Bio: body.Bio
    });   
};

const updateBody = async (req, res) => {
    const userID = req.body.username; 
    const { Name, Email, Height, Weight, Age, Gender, BMR, YearsOfWorkoutExperience, Bio } = req.body;

    try {
        const updatedProfile = await User.findOneAndUpdate(
            {username: userID},
            {
                $set: { Name, Email, Height, Weight, Age, Gender, BMR, YearsOfWorkoutExperience, Bio },
            },
            { new: true } 
        );

        if (!updatedProfile) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: error.message });
    }
};


module.exports ={
    getBodyInfo,
    updateBody
}
