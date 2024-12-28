const User = require('../models/User');
const Routine = require('../models/routineModel');
const getBodyInfo = async (req, res) =>{
    const userID = req.body.username;
    const ID = req.user.id;
    const routines = await Routine.find({user: ID}).sort({ createdAt: -1 }); 
    let totalWorkouts = 0;
    routines.forEach(
        (routine) => {
            totalWorkouts += routine.completionStats.length
        }
    );

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
        Bio: body.Bio,
        MemberSince: body.MemberSince,
        TotalWorkouts: totalWorkouts,
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
