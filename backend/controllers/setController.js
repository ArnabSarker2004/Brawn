const Routine = require('../models/routineModel'); // Assuming the routine model is in the models folder
const mongoose = require('mongoose');

// Get all sets within a workout in a routine
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

// Get a specific set within a workout in a routine
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

// Add a new set to a workout within a routine
const addSet = async (req, res) => {
    const { routineId, workoutId } = req.params;
    const { weight, reps } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(routineId) || !mongoose.Types.ObjectId.isValid(workoutId)) {
        return res.status(404).json({ error: 'Invalid routine or workout ID' });
    }

    // Find the routine by ID
    const routine = await Routine.findById(routineId);

    if (!routine) {
        return res.status(404).json({ error: 'Routine not found' });
    }

    // Find the workout within the routine
    const workout = routine.workouts.id(workoutId);

    if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
    }

    // Create a new set and add it to the workout's sets array
    const newSet = { weight, reps };
    workout.sets.push(newSet);

    try {
        await routine.save(); // Save the updated routine document
        res.status(201).json(newSet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a specific set within a workout in a routine
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

// Delete a specific set within a workout in a routine
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

    // Use pull instead of remove
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
