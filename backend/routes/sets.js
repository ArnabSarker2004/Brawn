const express = require('express');
const {
  getAllSets,
  getSet,
  addSet,
  updateSet,
  deleteSet
} = require('../controllers/setController');

const router = express.Router({ mergeParams: true });

router.post('/:routineId/workouts/:workoutId/sets', addSet);

router.get('/:routineId/workouts/:workoutId/sets', getAllSets);

router.get('/:routineId/workouts/:workoutId/sets/:setId', getSet);

router.patch('/:routineId/workouts/:workoutId/sets/:setId', updateSet);

router.delete('/:routineId/workouts/:workoutId/sets/:setId', deleteSet);

module.exports = router;
