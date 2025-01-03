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

    // Helper function to validate time string
    const isValidTimeFormat = (timeStr) => {
        // Allow 1-6 digits
        return /^\d{1,6}$/.test(timeStr);
    };

    // Helper function to convert time string to seconds
    const timeStringToSeconds = (timeStr) => {
        // Pad to 6 digits
        const paddedTime = timeStr.padStart(6, '0');
        
        const hours = parseInt(paddedTime.slice(0, 2));
        const minutes = parseInt(paddedTime.slice(2, 4));
        const seconds = parseInt(paddedTime.slice(4, 6));
        
        if (minutes >= 60 || seconds >= 60) {
            throw new Error('Invalid time: minutes and seconds must be less than 60');
        }
        
        return (hours * 3600) + (minutes * 60) + seconds;
    };

    // Helper function to convert seconds to HHMMSS
    const secondsToTimeString = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}${minutes}${seconds}`;
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

        const processedSets = sets.map(set => {
            if (timeBased || cardio) {
                if (typeof set.time === 'string') {
                    if (!isValidTimeFormat(set.time)) {
                        throw new Error(`Invalid time format. Expected HHMMSS, got ${set.time}`);
                    }
                    return {
                        ...set,
                        time: timeStringToSeconds(set.time),
                        reps: 0,
                        weight: cardio ? 0 : (set.weight || 0)
                    };
                }
                return {
                    ...set,
                    time: parseInt(set.time) || 0,
                    reps: 0,
                    weight: cardio ? 0 : (set.weight || 0)
                };
            }
            return {
                ...set,
                time: 0,
                reps: parseInt(set.reps) || 0,
                weight: parseInt(set.weight) || 0
            };
        });

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
