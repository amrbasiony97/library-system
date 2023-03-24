const mongoose = require('mongoose');

require('../Models/employeeModel');
const EmployeeSchema = mongoose.model('employees');
const crudMW = require('../Core/Middlewares/crudMW');

exports.getAllEmployees = crudMW.getAllDocuments(
	EmployeeSchema,
	'employees',
	request => ({
		firstName: { $regex: request.query.firstname || '', $options: 'i' },
		lastName: { $regex: request.query.lastname || '', $options: 'i' }
	})
);

exports.getEmployeeById = crudMW.getDocumentById(EmployeeSchema, 'employee');

exports.addEmployee = crudMW.addDocument(
	EmployeeSchema,
	'employee',
	request => ({
		firstName: request.body.firstName,
		lastName: request.body.lastName,
		email: request.body.email,
		gender: request.body.gender,
		birthDate: request.body.birthDate,
		salary: request.body.salary
	})
);

exports.updateEmployeeByAdmin = crudMW.updateDocument(
	EmployeeSchema,
	'employee',
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

exports.updateEmployeeById = crudMW.updateDocumentById(
	EmployeeSchema,
	'employee',
	request => ({
		firstName: request.body.firstName,
		lastName: request.body.lastName,
		password: request.body.password,
		gender: request.body.gender,
		birthDate: request.body.birthDate
	})
);

exports.activateEmployee = crudMW.activateUser(
	EmployeeSchema,
	'employee',
	request => ({
		firstName: request.body.firstName,
		lastName: request.body.lastName,
		password: request.body.newPassword,
		gender: request.body.gender,
		birthDate: request.body.birthDate
	})
);

exports.deleteEmployee = crudMW.deleteDocument(
	EmployeeSchema,
	'employee',
	'The employee cannot be deleted because he/she is still responsible for returning borrowed or read books'
);
