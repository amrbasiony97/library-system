const mongoose = require('mongoose');

require('../Models/memberModel');
const MemberSchema = mongoose.model('members');
const crudMW = require('../Core/Middlewares/crudMW');

exports.getAllMembers = crudMW.getAllDocuments(
	MemberSchema,
	'members',
	request => ({
		firstName: { $regex: request.query.firstname || '', $options: 'i' },
		lastName: { $regex: request.query.lastname || '', $options: 'i' }
	})
);
