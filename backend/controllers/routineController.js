const Routine = require('../models/routineModel'); // Update the path if needed
const mongoose = require('mongoose');

// Get all routines
const getRoutines = async (req, res) => {
  const routines = await Routine.find({}).sort({ createdAt: -1 });
  res.status(200).json(routines);
};

// Get a single routine by ID
const getRoutine = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such routine' });
  }

  const routine = await Routine.findById(id);

  if (!routine) {
    return res.status(404).json({ error: 'No such routine' });
  }

  res.status(200).json(routine);
};

// Create a new routine
const createRoutine = async (req, res) => {
  const { name, workouts } = req.body;

  let emptyFields = [];

  if (!name) {
    emptyFields.push('name');
  }
  
  if (workouts && (!Array.isArray(workouts))) {
    emptyFields.push('workouts');
  }

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
  }

  try {
    const routine = await Routine.create({ name, workouts: workouts || [] });
    res.status(200).json(routine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a routine by ID
const deleteRoutine = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such routine' });
  }

  const routine = await Routine.findOneAndDelete({ _id: id });

  if (!routine) {
    return res.status(404).json({ error: 'No such routine' });
  }

  res.status(200).json(routine);
};

// Update a routine by ID
const updateRoutine = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such routine' });
  }

  // Use { new: true } to return the updated routine
  const routine = await Routine.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

  if (!routine) {
    return res.status(404).json({ error: 'No such routine' });
  }

  res.status(200).json(routine);
};

module.exports = {
  getRoutines,
  getRoutine,
  createRoutine,
  deleteRoutine,
  updateRoutine
};
