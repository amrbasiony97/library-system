const mongoose = require('mongoose');
const extendSchema = require('mongoose-extend-schema');
const autoIncrement = require('mongoose-sequence')(mongoose);
const staffSchema = require('./staffModel');

// Create employee schema
const employeeSchema = staffSchema;

// Add auto increment plugin
employeeSchema.plugin(autoIncrement, { id: 'employeeId', inc_field: '_id' });

// Mapping Schema to Model
mongoose.model('employee', employeeSchema);
