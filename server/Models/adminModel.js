const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);
const StaffSchema = require('./staffModel');

// Create admin schema
const AdminSchema = StaffSchema;

// Add auto increment plugin
AdminSchema.plugin(autoIncrement, {
    id: 'admins_counter'
});

// Mapping Schema to Model
mongoose.model('admins', AdminSchema);
