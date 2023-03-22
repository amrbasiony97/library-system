const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);

// Create transaction schema
const TransactionSchema = new mongoose.Schema(
	{
		_id: Number,
        bookId: {
            type: Number,
            ref: 'books',
            required: true
        },
        memberId: {
            type: Number,
            ref: 'members',
            required: true
        },
        employeeId: {
            type: Number,
            ref: 'employees',
            required: true
        },
        startDate: {
            type: Date,
            default: Date.now()
        },
        endDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["borrow", "read"],
            required: true
        },
        isReturned:{
            type: Boolean,
            default: false
        }
	},
	{ _id: false }
);

// Add auto increment plugin
TransactionSchema.plugin(autoIncrement, {
	id: 'transactions_counter'
});

// Mapping Schema to Model
mongoose.model('transactions', TransactionSchema);
