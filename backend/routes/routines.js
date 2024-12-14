const express = require('express');
const {
  getRoutines,
  getRoutine,
  createRoutine,
  deleteRoutine,
  updateRoutine
} = require('../controllers/routineController');

const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth); 

router.get('/', getRoutines);

router.get('/:id', getRoutine);

router.post('/', createRoutine);

router.delete('/:id', deleteRoutine);

router.patch('/:id', updateRoutine);

module.exports = router;
