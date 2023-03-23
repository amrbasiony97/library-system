const mongoose = require('mongoose');

require('../Models/employeeModel');
const EmployeeSchema = mongoose.model('employees');
const crudMW = require('../Core/Middlewares/crudMW');

exports.getAllEmployees = crudMW.getAllUsers(EmployeeSchema, 'employees');

exports.getEmployeeById = crudMW.getUserByID(EmployeeSchema, 'employee');

exports.addEmployee = crudMW.addUser(EmployeeSchema, 'employee');

exports.updateEmployeeByAdmin = crudMW.updateUser(EmployeeSchema, 'employee');

exports.updateEmployeeById = crudMW.updateUserById(EmployeeSchema, 'employee');

exports.activateEmployee = crudMW.activateUser(EmployeeSchema, 'employee');

exports.deleteEmployee = crudMW.deleteUser(
	EmployeeSchema,
	'employee',
	'employeeId',
	"The employee cannot be deleted because he/she is still responsible for returning borrowed or read books"
);
