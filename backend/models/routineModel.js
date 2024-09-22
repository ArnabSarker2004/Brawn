const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Set schema
const setSchema = new Schema({
  weight: {
    type: Number,
    required: true
  },
  reps: Number,  // Optional, based on the workout's timeBased flag
  time: Number   // Optional, also based on the workout's timeBased flag
});

// Define the Workout schema
const workoutSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  timeBased: {
    type: Boolean,
    required: true  // Specifies if the workout uses time instead of reps
  },
  sets: {
    type: [setSchema],
    default: []  // Ensures the array exists even if it's empty
  }
});

// Define the Routine schema
const routineSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  workouts: {
    type: [workoutSchema],
    default: []  // Ensures the array exists even if it's empty
  }
}, { timestamps: true });

module.exports = mongoose.model('Routine', routineSchema);
