const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
require('../Models/employeeModel');
require('../Models/userRoleModel');
require('../Models/transactionModel');
const EmployeeSchema = mongoose.model('employees');
const UserRoleSchema = mongoose.model('users_roles');
const TransactionSchema = mongoose.model('transactions');
const { generatePassword } = require('../Core/Utilities/utilities');
const saltRounds = 10;

exports.getAllEmployees = (request, response, next) => {
	// Get all employees if there is no firstname nor lastname were entered
	request.query.firstname = request.query.firstname || '';
	request.query.lastname = request.query.lastname || '';

	EmployeeSchema.find({
		firstName: { $regex: request.query.firstname, $options: 'i' },
		lastName: { $regex: request.query.lastname, $options: 'i' }
	})
		.then(employees => {
			response.status(200).json({ employees });
		})
		.catch(error => {
			next(error);
		});
};

exports.getEmployeeById = (request, response, next) => {
	EmployeeSchema.findOne({ _id: request.params.id })
		.then(employee => {
			if (employee) {
				response.status(200).json({ employee });
			} else {
				let error = new Error('Employee not found');
				error.status = 404;
				next(error);
			}
		})
		.catch(error => {
			next(error);
		});
};

exports.addEmployee = (request, response, next) => {
	const imagePath = request.file ? request.file.path : null;

	new EmployeeSchema({
		firstName: request.body.firstName,
		lastName: request.body.lastName,
		email: request.body.email,
		tmpPassword: generatePassword(16),
		gender: request.body.gender,
		birthDate: request.body.birthDate,
		salary: request.body.salary,
		image: imagePath
	})
		.save()
		.then(employeeData => {
			request.body.employeeData = employeeData;
			return new UserRoleSchema({
				email: request.body.email,
				role: 'employee'
			}).save();
		})
		.then(userRoleData => {
			response.status(201).json({
				employeeData: request.body.employeeData,
				userRoleData
			});
		})
		.catch(error => {
			next(error);
		});
};

exports.updateEmployeeByAdmin = (request, response, next) => {
	let imagePath = request.file ? request.file.path : null;

	if (request.body.password) {
		request.body.password = bcrypt.hashSync(
			request.body.password,
			saltRounds
		);
	}
	EmployeeSchema.findOne({ _id: request.body.id })
		.then(employee => {
			let error = new Error();
			error.status = 403;
			error.message = null;

			if (!employee) {
				error.status = 404;
				error.message = 'Employee not found';
			} else if (request.body.password && employee.tmpPassword) {
				error.message = "Employee didn't activate his/her account yet";
			} else if (request.body.hireDate) {
				error.message =
					'hireDate cannot be changed once the user has been created';
			}

			if (error.message) {
				throw error;
			}
			// Save oldEmail to update email in users_roles collection if needed
			request.body.oldEmail = request.body.email ? employee.email : null;

			if (employee.image) {
				if (imagePath) {
					fs.unlink(employee.image, error => {});
				} else {
					imagePath = employee.image;
				}
			}
			return EmployeeSchema.updateOne(
				{
					_id: request.body.id
				},
				{
					$set: {
						firstName: request.body.firstName,
						lastName: request.body.lastName,
						email: request.body.email,
						password: request.body.password,
						gender: request.body.gender,
						birthDate: request.body.birthDate,
						salary: request.body.salary,
						image: imagePath
					}
				}
			);
		})
		.then(data => {
			if (data.matchedCount === 0) {
				let error = new Error('Employee not found');
				error.status = 404;
				throw error;
			} else {
				return UserRoleSchema.updateOne(
					{
						email: request.body.oldEmail
					},
					{
						$set: {
							email: request.body.email
						}
					}
				);
			}
		})
		.then(data => {
			response
				.status(200)
				.json({ message: 'Employee updated successfully' });
		})
		.catch(error => {
			next(error);
		});
};

exports.updateEmployeeById = (request, response, next) => {
	let imagePath = request.file ? request.file.path : null;

	if (request.body.password) {
		request.body.password = bcrypt.hashSync(
			request.body.password,
			saltRounds
		);
	}
	EmployeeSchema.findOne({ _id: request.params.id })
		.then(employee => {
			let error = new Error();
			error.status = 403;
			error.message = null;

			if (!employee) {
				error.status = 404;
				error.message = 'Employee not found';
			}
			if (request.body.password && employee.tmpPassword) {
				error.message = "Employee didn't activate his/her account yet";
			}
			if (
				request.body.email ||
				request.body.salary ||
				request.body.hireDate
			) {
				error.message =
					"Employee doesn't has the permissions to update email, salary or hireDate";
			}

			if (error.message) {
				throw error;
			}

			if (employee.image) {
				if (imagePath) {
					fs.unlink(employee.image, error => {});
				} else {
					imagePath = employee.image;
				}
			}
			return EmployeeSchema.updateOne(
				{
					_id: request.params.id
				},
				{
					$set: {
						firstName: request.body.firstName,
						lastName: request.body.lastName,
						password: request.body.password,
						gender: request.body.gender,
						birthDate: request.body.birthDate,
						image: imagePath
					}
				}
			);
		})
		.then(data => {
			if (data.matchedCount === 0) {
				let error = new Error('Employee not found');
				error.status = 404;
				throw error;
			} else {
				response
					.status(200)
					.json({ message: 'Employee updated successfully' });
			}
		})
		.catch(error => {
			next(error);
		});
};

exports.activateEmployee = (request, response, next) => {
	let imagePath = request.file ? request.file.path : null;

	if (request.body.newPassword) {
		request.body.newPassword = bcrypt.hashSync(
			request.body.newPassword,
			saltRounds
		);
	}
	EmployeeSchema.findOne({ _id: request.params.id })
		.then(employee => {
			let error = new Error();
			error.status = 403;
			error.message = null;

			if (!employee) {
				error.status = 404;
				error.message = 'Employee not found';
			}
			if (employee.password) {
				error.status = 200;
				error.message = 'Account is already activated';
			}
			if (request.body.oldPassword !== employee.tmpPassword) {
				error.message = 'oldPassword is incorrect';
			}
			if (
				request.body.email ||
				request.body.salary ||
				request.body.hireDate
			) {
				error.message =
					"Employee doesn't has the permissions to update email, salary or hireDate";
			}

			if (error.message) {
				throw error;
			}

			if (employee.image) {
				if (imagePath) {
					fs.unlink(employee.image, error => {});
				} else {
					imagePath = employee.image;
				}
			}
			return EmployeeSchema.updateOne(
				{
					_id: request.params.id
				},
				{
					$set: {
						firstName: request.body.firstName,
						lastName: request.body.lastName,
						password: request.body.newPassword,
						gender: request.body.gender,
						birthDate: request.body.birthDate,
						image: imagePath
					},
					$unset: {
						tmpPassword: 1
					}
				}
			);
		})
		.then(data => {
			if (data.matchedCount === 0) {
				let error = new Error('Employee not found');
				error.status = 404;
				throw error;
			} else {
				response
					.status(200)
					.json({ message: 'Employee updated successfully' });
			}
		})
		.catch(error => {
			next(error);
		});
};

exports.deleteEmployee = (request, response, next) => {
	EmployeeSchema.findOne({ _id: request.body.id })
		.then(employee => {
			if (employee === null) {
				let error = new Error('Employee not found');
				error.status = 404;
				throw error;
			}
			request.body.email = employee.email;
			request.body.image = employee.image;
			return TransactionSchema.findOne({
				employeeId: request.body.id,
				isReturnd: false
			});
		})
		.then(transaction => {
			if (transaction !== null) {
				let error = new Error(
					"Employee can't be deleted as he is still responsible for returning borrowed/read books"
				);
				error.status = 409;
				throw error;
			}
			if (request.body.image !== null) {
				fs.unlink(request.body.image, error => {});
			}
			return EmployeeSchema.deleteOne({ _id: request.body.id });
		})
		.then(data => {
			if (data.deletedCount == 0) {
				let error = new Error('Employee not found');
				error.status = 404;
				throw error;
			} else {
				return UserRoleSchema.deleteOne({ email: request.body.email });
			}
		})
		.then(data => {
			response
				.status(200)
				.json({ data: 'Employee deleted successfully' });
		})
		.catch(error => {
			next(error);
		});
};
