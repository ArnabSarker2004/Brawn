const Routine = require('../models/routineModel'); 
const mongoose = require('mongoose');

const getRoutines = async (req, res) => {
    const userID = req.user.id;
    const routines = await Routine.find({user: userID}).sort({ createdAt: -1 }); 
    res.status(200).json(routines);
};

const getRoutine = async (req, res) => {
    const { id } = req.params;
    const userID = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such routine' });
    }

    const routine = await Routine.findOne({_id: id, user: userID});

    if (!routine) {
        return res.status(404).json({ error: 'No such routine' });
    }

    res.status(200).json(routine);
};

const createRoutine = async (req, res) => {
    const userID = req.user.id;
    const { name, workouts } = req.body;

    let emptyFields = [];

    if (!name) {
        emptyFields.push('name');
    }

    if (workouts && (!Array.isArray(workouts))) {
        emptyFields.push('workouts');
    }

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
    }

    try {
        const routine = await Routine.create({ 
            name, 
            workouts: workouts || [],
            user: userID 
        });
        res.status(200).json(routine);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteRoutine = async (req, res) => {
    const { id } = req.params;
    const userID = req.user.id;


    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such routine' });
    }

    const routine = await Routine.findOneAndDelete({ _id: id, user: userID });

    if (!routine) {
        return res.status(404).json({ error: 'No such routine' });
    }

    res.status(200).json(routine);
};

const updateRoutine = async (req, res) => {
    const userID = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such routine' });
    }

    const routine = await Routine.findOneAndUpdate(
        { _id: id, user: userID },
        { ...req.body }, 
        { new: true });

    if (!routine) {
        return res.status(404).json({ error: 'No such routine' });
    }

    res.status(200).json(routine);
};

const completeRoutine = async (req, res) => {
    const { id } = req.params;
    const userID = req.user.id;
    const time = req.body.value;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such routine' });
    }

    const routine = await Routine.findOne({ _id: id, user: userID });

    if (!routine) {
        return res.status(404).json({ error: 'No such routine' });
    }

    //keep this comment for cardio
    // var totalTime = routine.workouts.reduce((acc, workout) => {
    //     return  acc + workout.sets.reduce((timeAcc, set) => timeAcc + (set.time || 0), 0);
    // }, 0);
    var totalTime = time;


    var totalReps = routine.workouts.reduce((acc, workout) => {
        // Calculate total reps for the current workout
        const workoutReps = workout.sets.reduce((repsAcc, set) => repsAcc + (set.reps || 0), 0);


        const updatedAcc = acc + workoutReps;
        
        return updatedAcc;
    }, 0);
    
    console.log(`Final Total Reps: ${totalReps}`);
    
    console.log(totalReps);
    var total = routine.workouts.reduce((acc, workout) => {

        return acc + workout.sets.reduce((weightAcc, set) => weightAcc + (set.weight || 0), 0);
    }, 0);
    
    var totalWeight = totalReps * total; //st

    routine.completionStats.push({
        date: new Date().toISOString(),
        totalTime,
        totalWeight //retarded stat
    });


    await routine.save();

    res.status(200).json(routine);
};  

module.exports = {
    getRoutines,
    getRoutine,
    createRoutine,
    deleteRoutine,
    updateRoutine,
    completeRoutine
};
