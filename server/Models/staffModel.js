const mongoose = require('mongoose');
const extendSchema = require('mongoose-extend-schema');
const userSchema = require('./userModel');

// Create staff schema
module.exports = extendSchema(userSchema, {
    hireDate: {
        type: Date,
        default: Date.now()
    },
    salary: {
        type: Number,
        default: 3500
    }
});
