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
        required: true,
        minlength: 3
    },

    FirstName: {
        type: String,
        required: false,
    },

    LastName:{
        type:String,
        required: false
    },

    Age:{
        type: Number,
        required: false,
        min: 0
    },

    YearsOfWorkoutExperience:{
        type: Number,
        required: false,
        min: 0
    },

    Gender:{
        type: String,
        required: false
    },

    Height:{
        type: String,
        required:false,
        min: 0
    },

    Weight:{
        type: Number,
        required: false,
        min: 0
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
