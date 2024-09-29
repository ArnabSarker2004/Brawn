const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password,12);
})

module.exports = mongoose.model('User', UserSchema);
