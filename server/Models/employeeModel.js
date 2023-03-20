const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);
const StaffSchema = require('./staffModel');

// Create employee schema
const EmployeeSchema = StaffSchema;

// Add auto increment plugin
EmployeeSchema.plugin(autoIncrement, { inc_field: '_id' });

// Increment _id only if the user has been added successfully to database
EmployeeSchema.pre('save', function (next) {
    if (this.isNew) {
        this._id++;
    }
    next();
});

// Mapping Schema to Model
mongoose.model('employees', EmployeeSchema);
