    const Routine = require('../models/routineModel');
    const mongoose = require('mongoose');

    const getWorkouts = async (req, res) => {
        const { routineId} = req.params;

        if (!mongoose.Types.ObjectId.isValid(routineId)) {
            return res.status(404).json({ error: 'No such routine' });
        }

        const routine = await Routine.findById(routineId);

        if (!routine) {
            return res.status(404).json({ error: 'No such routine' });
        }

        res.status(200).json(routine.workouts);
    };

    const getWorkout = async (req, res) => {
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

        res.status(200).json(workout);
    };

    const createWorkout = async (req, res) => {
        const { routineId } = req.params;
        const { title, timeBased, sets } = req.body;

        let emptyFields = [];
        if (!title) emptyFields.push('title');

        if (timeBased) {
            sets.forEach((set, index) => {
            if (!set.time) emptyFields.push(`sets[${index}].time`);
            if (!set.weight) emptyFields.push(`sets[${index}].weight`);
            });
        } else {
            sets.forEach((set, index) => {
            if (!set.reps) emptyFields.push(`sets[${index}].reps`);
            if (!set.weight) emptyFields.push(`sets[${index}].weight`);
            });
        }

        if (!mongoose.Types.ObjectId.isValid(routineId)) {
            return res.status(404).json({ error: 'No such routine' });
        }

        const routine = await Routine.findById(routineId);

        if (!routine) {
            return res.status(404).json({ error: 'No such routine' });
        }

        const newWorkout = { title, timeBased, sets };
        routine.workouts.push(newWorkout);

        try {
            await routine.save();
            res.status(201).json(routine.workouts[routine.workouts.length - 1]);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    const updateWorkout = async (req, res) => {
        const { routineId, workoutId } = req.params;
        const { title, sets, timeBased } = req.body;

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

        workout.title = title;
        workout.timeBased = timeBased;
        workout.sets = sets; 

        try {
            await routine.save();
            res.status(200).json(workout);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    const deleteWorkout = async (req, res) => {
        const { routineId, workoutId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(routineId) || !mongoose.Types.ObjectId.isValid(workoutId)) {
            return res.status(404).json({ error: 'No such routine or workout' });
        }

        const routine = await Routine.findById(routineId);

        if (!routine) {
            return res.status(404).json({ error: 'No such routine' });
        }

        routine.workouts.pull(workoutId);

        try {
            await routine.save();
            res.status(200).json({ message: 'Workout removed' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    module.exports = {
        getWorkouts,
        getWorkout,
        createWorkout,
        updateWorkout,
        deleteWorkout
    };
