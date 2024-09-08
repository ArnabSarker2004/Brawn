const Routine = require('../models/routineModel');
const mongoose = require('mongoose');

// Get all workouts within a routine
const getWorkouts = async (req, res) => {
  const { routineId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(routineId)) {
    return res.status(404).json({ error: 'No such routine' });
  }

  const routine = await Routine.findById(routineId);

  if (!routine) {
    return res.status(404).json({ error: 'No such routine' });
  }

  res.status(200).json(routine.workouts);
};

// Get a specific workout within a routine
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

// Add a new workout to a routine
const createWorkout = async (req, res) => {
  const { routineId } = req.params;
  const { title, sets } = req.body;

  let emptyFields = [];
  if (!title) emptyFields.push('title');
  if (!sets || !Array.isArray(sets) || sets.length === 0) {
    emptyFields.push('sets');
  } else {
    sets.forEach((set, index) => {
      if (!set.reps) emptyFields.push(`sets[${index}].reps`);
      if (!set.weight) emptyFields.push(`sets[${index}].weight`);
    });
  }

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all fields', emptyFields });
  }

  if (!mongoose.Types.ObjectId.isValid(routineId)) {
    return res.status(404).json({ error: 'No such routine' });
  }

  const routine = await Routine.findById(routineId);

  if (!routine) {
    return res.status(404).json({ error: 'No such routine' });
  }

  const newWorkout = { title, sets };
  routine.workouts.push(newWorkout);

  try {
    await routine.save();
    // Return the last workout added (with ID)
    res.status(200).json(routine.workouts[routine.workouts.length - 1]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a specific workout within a routine
const updateWorkout = async (req, res) => {
  const { routineId, workoutId } = req.params;
  const { title, sets } = req.body;

  let emptyFields = [];
  if (!title) emptyFields.push('title');
  if (!sets || !Array.isArray(sets) || sets.length === 0) {
    emptyFields.push('sets');
  } else {
    sets.forEach((set, index) => {
      if (!set.reps) emptyFields.push(`sets[${index}].reps`);
      if (!set.weight) emptyFields.push(`sets[${index}].weight`);
    });
  }

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all fields', emptyFields });
  }

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
  workout.sets = sets;

  try {
    await routine.save();
    res.status(200).json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a specific workout within a routine
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
    res.status(200).json({ message: 'Workout removed', routine });
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
