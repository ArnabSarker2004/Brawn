const express = require('express');
const {
    getWorkouts,
    getWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout
} = require('../controllers/workoutController');
const router = express.Router({ mergeParams: true });

// Routes for managing workouts within a routine

// GET all workouts within a specific routine
router.get('/:routineId/workouts', getWorkouts);

// GET a specific workout within a routine
router.get('/:routineId/workouts/:workoutId', getWorkout);

// POST a new workout within a routine
router.post('/:routineId/workouts', createWorkout);

// PATCH (update) a specific workout within a routine
router.patch('/:routineId/workouts/:workoutId', updateWorkout);

// DELETE a specific workout within a routine
router.delete('/:routineId/workouts/:workoutId', deleteWorkout);

module.exports = router;
