const Routine = require('../models/routineModel'); 
const mongoose = require('mongoose');

const getAllSets = async (req, res) => {
    const { routineId, workoutId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(routineId) || !mongoose.Types.ObjectId.isValid(workoutId)) {
        return res.status(404).json({ error: 'No such routine or workout' });
    }

    const routine = await Routine.findById(routineId);

    if (!routine) {
        return res.status(404).json({ error: 'No such routine' });
    }

    const workout = routine.workouts.id(workoutId);

    if (!workout) {
        return res.status(404).json({ error: 'No such workout' });
    }

    res.status(200).json(workout.sets);
};

const getSet = async (req, res) => {
    const { routineId, workoutId, setId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(routineId) || !mongoose.Types.ObjectId.isValid(workoutId) || !mongoose.Types.ObjectId.isValid(setId)) {
        return res.status(404).json({ error: 'No such routine, workout, or set' });
    }

    const routine = await Routine.findById(routineId);

    if (!routine) {
        return res.status(404).json({ error: 'No such routine' });
    }

    const workout = routine.workouts.id(workoutId);

    if (!workout) {
        return res.status(404).json({ error: 'No such workout' });
    }

    const set = workout.sets.id(setId);

    if (!set) {
        return res.status(404).json({ error: 'No such set' });
    }

    res.status(200).json(set);
};

const addSet = async (req, res) => {
    const { routineId, workoutId } = req.params;
    const { weight, reps } = req.body;

    if (!mongoose.Types.ObjectId.isValid(routineId) || !mongoose.Types.ObjectId.isValid(workoutId)) {
        return res.status(404).json({ error: 'Invalid routine or workout ID' });
    }

    // Find the routine by ID
    const routine = await Routine.findById(routineId);

    if (!routine) {
        return res.status(404).json({ error: 'Routine not found' });
    }

    const workout = routine.workouts.id(workoutId);

    if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
    }

    const newSet = { weight, reps };
    workout.sets.push(newSet);

    try {
        await routine.save(); 
        res.status(201).json(newSet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateSet = async (req, res) => {
    const { routineId, workoutId, setId } = req.params;
    const { reps, weight } = req.body;

    if (!mongoose.Types.ObjectId.isValid(routineId) || !mongoose.Types.ObjectId.isValid(workoutId) || !mongoose.Types.ObjectId.isValid(setId)) {
        return res.status(404).json({ error: 'No such routine, workout, or set' });
    }

    const routine = await Routine.findById(routineId);

    if (!routine) {
        return res.status(404).json({ error: 'No such routine' });
    }

    const workout = routine.workouts.id(workoutId);

    if (!workout) {
        return res.status(404).json({ error: 'No such workout' });
    }

    const set = workout.sets.id(setId);

    if (!set) {
        return res.status(404).json({ error: 'No such set' });
    }

    if (reps !== undefined) set.reps = reps;
    if (weight !== undefined) set.weight = weight;

    try {
        await routine.save();
        res.status(200).json(set);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteSet = async (req, res) => {
    const { routineId, workoutId, setId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(routineId) || !mongoose.Types.ObjectId.isValid(workoutId) || !mongoose.Types.ObjectId.isValid(setId)) {
        return res.status(404).json({ error: 'No such routine, workout, or set' });
    }

    const routine = await Routine.findById(routineId);

    if (!routine) {
        return res.status(404).json({ error: 'No such routine' });
    }

    const workout = routine.workouts.id(workoutId);

    if (!workout) {
        return res.status(404).json({ error: 'No such workout' });
    }

    workout.sets.pull({ _id: setId });

    try {
        await routine.save();
        res.status(200).json({ message: 'Set removed', workout });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports = {
    getAllSets,
    getSet,
    addSet,
    updateSet,
    deleteSet
};
