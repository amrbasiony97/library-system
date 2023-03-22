const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);
const StaffSchema = require('./staffModel');

// Create employee schema
const EmployeeSchema = StaffSchema;

// Add auto increment plugin
EmployeeSchema.plugin(autoIncrement, {
    id: 'employees_counter'
});

// Mapping Schema to Model
mongoose.model('employees', EmployeeSchema);
