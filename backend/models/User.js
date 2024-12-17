const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    FirstName: {
        type: String,
        required: true,
    },

    LastName:{
        type:String,
        required: true
    },

    Age:{
        type: Number,
        required: false
    },

    YearsOfWorkoutExperience:{
        type: Number,
        required: false
    },

    Gender:{
        type: String,
        required: true
    },

    Height:{
        type: String,
        required: true
    },

    Weight:{
        type: Number,
        required: true
    },

    BMR:{
        type: Number, 
        required: false
    },

    IsNewUser:{
        type: Boolean,
        required: false
    }
});

module.exports = mongoose.model('User', userSchema);
