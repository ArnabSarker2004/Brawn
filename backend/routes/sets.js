const express = require('express');
const {
  getAllSets,
  getSet,
  addSet,
  updateSet,
  deleteSet
} = require('../controllers/setController');

const router = express.Router({ mergeParams: true });

// POST a new set to a workout within a routine
router.post('/:routineId/workouts/:workoutId/sets', addSet);

// GET all sets within a workout
router.get('/:routineId/workouts/:workoutId/sets', getAllSets);

// GET a specific set within a workout
router.get('/:routineId/workouts/:workoutId/sets/:setId', getSet);

// PATCH (update) a specific set within a workout
router.patch('/:routineId/workouts/:workoutId/sets/:setId', updateSet);

// DELETE a specific set within a workout
router.delete('/:routineId/workouts/:workoutId/sets/:setId', deleteSet);

module.exports = router;
