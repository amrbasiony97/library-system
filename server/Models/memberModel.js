const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);
const ExtendSchema = require('mongoose-extend-schema');
const UserSchema = require('./userModel');

// Create member schema
const MemberSchema = ExtendSchema(UserSchema, {
    phone: String,
    address: Object,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    preventBorrowUntil: {
        type: Date,
        default: null
    },
    isBanned: {
        type: Boolean,
        default: false
    }
});

// Add auto increment plugin
MemberSchema.plugin(autoIncrement, {
    id: 'members_counter'
});

// Mapping Schema to Model
mongoose.model('members', MemberSchema);
