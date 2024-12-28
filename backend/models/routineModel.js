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
    completionStats: {
        type: [
        {
            date: {
                type: String, 
                required: false
            },
            totalTime: {
                type: Number,
                required: false
            },
            totalWeight: {
                type: Number,
                required: false
            }
        }
        ],
        default: []
    }
},
{ timestamps: true });


module.exports = mongoose.model('Routine', routineSchema);
