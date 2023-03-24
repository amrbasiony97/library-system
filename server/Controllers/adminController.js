const mongoose = require('mongoose');

require('../Models/adminModel');
const AdminSchema = mongoose.model('admins');
const crudMW = require('../Core/Middlewares/crudMW');

exports.getAllAdmins = crudMW.getAllDocuments(
	AdminSchema,
	'admins',
	request => ({
		firstName: { $regex: request.query.firstname || '', $options: 'i' },
		lastName: { $regex: request.query.lastname || '', $options: 'i' }
	})
);

exports.getAdminById = crudMW.getDocumentById(AdminSchema, 'admin');

exports.addAdmin = crudMW.addDocument(
    AdminSchema,
    'admin',
    request => ({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        email: request.body.email,
        gender: request.body.gender,
        birthDate: request.body.birthDate,
        salary: request.body.salary
    })
);

exports.updateAdminByBasicAdmin = crudMW.updateDocument(
    AdminSchema,
    'admin',
    request => ({
		firstName: request.body.firstName,
		lastName: request.body.lastName,
		email: request.body.email,
		password: request.body.password,
		gender: request.body.gender,
		birthDate: request.body.birthDate,
		salary: request.body.salary
	})
);

exports.updateAdminById = crudMW.updateDocumentById(
    AdminSchema,
    'admin',
    request => ({
		firstName: request.body.firstName,
		lastName: request.body.lastName,
		password: request.body.password,
		gender: request.body.gender,
		birthDate: request.body.birthDate
	})
);

exports.activateAdmin = crudMW.activateUser(
    AdminSchema,
    'admin',
    request => ({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        password: request.body.newPassword,
        gender: request.body.gender,
        birthDate: request.body.birthDate
    })
);

exports.deleteAdmin = crudMW.deleteDocument(AdminSchema, 'admin', '');
