const express = require('express');
const {
  getRoutines,
  getRoutine,
  createRoutine,
  deleteRoutine,
  updateRoutine
} = require('../controllers/routineController'); // Adjust the path if needed

const router = express.Router();

// GET all routines
router.get('/', getRoutines);

// GET a single routine by ID
router.get('/:id', getRoutine);

// POST a new routine
router.post('/', createRoutine);

// DELETE a routine by ID
router.delete('/:id', deleteRoutine);

// PATCH (update) a routine by ID
router.patch('/:id', updateRoutine);

module.exports = router;
