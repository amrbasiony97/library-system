const mongoose = require('mongoose');
const { generatePassword } = require('../Core/Utilities/utilities');

// Create user schema
module.exports = new mongoose.Schema(
	{
		_id: Number,
		firstName: {
			type: String,
			required: true
		},
		lastName: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		tmpPassword: {
			type: String,
			default: generatePassword(16)
		},
		password: String,
		gender: {
			type: String,
			enum: ['male', 'female']
		},
		birthDate: Date,
		image: String
	},
	{ _id: false }
);
