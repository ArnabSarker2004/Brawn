const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Set schema
const setSchema = new Schema({
  reps: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  }
});

// Define the Workout schema
const workoutSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  sets: {
    type: [setSchema],
    default: [] // Default to an empty array if no sets are provided
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
    default: [] // Default to an empty array if no workouts are provided
  }
}, { timestamps: true });

// Export the Routine model based on the routineSchema
module.exports = mongoose.model('Routine', routineSchema);
