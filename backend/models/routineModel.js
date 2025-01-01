const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const setSchema = new Schema({
    weight: {
        type: Number,
        validate: {
            validator: function() {
                const workout = this.parent().parent();
                // Only validate if this is not a cardio workout
                if (workout.cardio) {
                    return true; // Skip validation for cardio workouts
                }
                return this.weight !== null && this.weight !== undefined;
            },
            message: 'Weight is required for non-cardio workouts'
        },
        default: function() {
            const workout = this.parent().parent();
            return workout.cardio ? 0 : undefined;
        }
    },
    reps: {
        type: Number,
        default: 0
    },
    time: {
        type: Number,
        default: 0
    }
});

const workoutSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    timeBased: {
        type: Boolean,
        default: false
    },
    cardio: {
        type: Boolean,
        default: false
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
