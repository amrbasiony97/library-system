const mongoose = require('mongoose');
const ExtendSchema = require('mongoose-extend-schema');
const UserSchema = require('./userModel');

// Create staff schema
module.exports = ExtendSchema(UserSchema, {
    hireDate: {
        type: Date,
        default: Date.now()
    },
    salary: {
        type: Number,
        default: 3500
    }
});
