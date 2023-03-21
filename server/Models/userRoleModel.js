const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);

// Create userRole schema
const UserRoleSchema = new mongoose.Schema(
    {
        _id: Number,
        email: {
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: String,
            enum: ['basic admin', 'admin', 'employee', 'member'],
            required: true
        }
    },
    { _id: false }
);

// Add auto increment plugin
UserRoleSchema.plugin(autoIncrement, { id: 'users_roles_counter' });

// Mapping Schema to Model
mongoose.model('users_roles', UserRoleSchema);
