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
        const { title, sets, timeBased, cardio } = req.body;

        if (!mongoose.Types.ObjectId.isValid(routineId)) {
            return res.status(404).json({ error: 'No such routine' });
        }

        const routine = await Routine.findById(routineId);

        if (!routine) {
            return res.status(404).json({ error: 'No such routine' });
        }

        const newWorkout = {
            title,
            timeBased,
            cardio,
            sets: sets.map(set => ({
                weight: cardio ? 0 : (set.weight || 0),
                reps: (cardio || timeBased) ? 0 : (set.reps || 0),
                time: (cardio || timeBased) ? (set.time || 0) : 0
            }))
        };

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
        const { title, sets, timeBased, cardio } = req.body;

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
        workout.cardio = cardio;
        workout.sets = sets.map(set => ({
            weight: cardio ? 0 : (set.weight || 0),
            reps: (cardio || timeBased) ? 0 : (set.reps || 0),
            time: (cardio || timeBased) ? (set.time || 0) : 0
        }));

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
