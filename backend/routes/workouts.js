const express = require('express');
const {
    getWorkouts,
    getWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout
} = require('../controllers/workoutController');
const router = express.Router({ mergeParams: true });

router.get('/:routineId/workouts', getWorkouts);

router.get('/:routineId/workouts/:workoutId', getWorkout);

router.post('/:routineId/workouts', createWorkout);

router.patch('/:routineId/workouts/:workoutId', updateWorkout);

router.delete('/:routineId/workouts/:workoutId', deleteWorkout);

module.exports = router;
