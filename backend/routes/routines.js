const express = require('express');
const {
  getRoutines,
  getRoutine,
  createRoutine,
  deleteRoutine,
  updateRoutine
} = require('../controllers/routineController'); // Adjust the path if needed

const router = express.Router();

router.get('/', getRoutines);

router.get('/:id', getRoutine);

router.post('/', createRoutine);

router.delete('/:id', deleteRoutine);

router.patch('/:id', updateRoutine);

module.exports = router;
