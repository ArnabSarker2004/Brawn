const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const setSchema = new Schema({
  weight: {
    type: Number,
    required: true
  },
  reps: Number,  
  time: Number   
});

const workoutSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  timeBased: {
    type: Boolean,
    required: true  
  },
  sets: {
    type: [setSchema],
    default: []  
  }
});

const routineSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  workouts: {
    type: [workoutSchema],
    default: []
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completionStats: {
    type: [
      {
        date: {
          type: Date, // Date when the routine was completed
          required: true
        },
        totalTime: {
          type: Number, // Total workout time for this session
          required: true
        },
        totalWeight: {
          type: Number, // Total weight lifted during this session
          required: true
        }
      }
    ],
    default: []
  }
},
  { timestamps: true });


module.exports = mongoose.model('Routine', routineSchema);
