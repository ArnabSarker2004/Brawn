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
        required: false,
    },

    LastName:{
        type:String,
        required: false
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
        required: false
    },

    Height:{
        type: String,
        required:false 
    },

    Weight:{
        type: Number,
        required: false 
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
