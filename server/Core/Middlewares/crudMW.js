const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');

require('../../Models/userRoleModel');
require('../../Models/transactionModel');
const UserRoleSchema = mongoose.model('users_roles');
const TransactionSchema = mongoose.model('transactions');
const {
	generatePassword,
	toCapitalCase
} = require('../../Core/Utilities/utilities');
const saltRounds = 10;

exports.getAllUsers = (schema, key) => {
	return (request, response, next) => {
		// Get all users if there is no firstname nor lastname were entered
		request.query.firstname = request.query.firstname || '';
		request.query.lastname = request.query.lastname || '';

		schema
			.find({
				firstName: { $regex: request.query.firstname, $options: 'i' },
				lastName: { $regex: request.query.lastname, $options: 'i' }
			})
			.then(user => {
				response.status(200).json({ [key]: user });
			})
			.catch(error => {
				next(error);
			});
	};
};

exports.getUserByID = (schema, key) => {
	return (request, response, next) => {
		schema
			.findOne({ _id: request.params.id })
			.then(user => {
				if (user) {
					response.status(200).json({ [key]: user });
				} else {
					let error = new Error(`${toCapitalCase(key)} not found`);
					error.status = 404;
					next(error);
				}
			})
			.catch(error => {
				next(error);
			});
	};
};

exports.addUser = (schema, key) => {
	return (request, response, next) => {
		const imagePath = request.file ? request.file.path : null;

		new schema({
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
			.then(user => {
				request.results = user;
				return new UserRoleSchema({
					email: request.body.email,
					role: key
				}).save();
			})
			.then(userRoleData => {
				response.status(201).json({
					[key]: request.results,
					userRoleData
				});
			})
			.catch(error => {
				next(error);
			});
	};
};

exports.updateUser = (schema, key) => {
	return (request, response, next) => {
		let imagePath = request.file ? request.file.path : null;

		if (request.body.password) {
			request.body.password = bcrypt.hashSync(
				request.body.password,
				saltRounds
			);
		}
		schema
			.findOne({ _id: request.body.id })
			.then(user => {
				let error = new Error();
				error.status = 403;
				error.message = null;

				if (!user) {
					error.status = 404;
					error.message = `${toCapitalCase(key)} not found`;
					throw error;
				} else if (request.body.password && user.tmpPassword) {
					error.message = `${toCapitalCase(
						key
					)} didn't activate his/her account yet`;
				} else if (request.body.hireDate) {
					error.message =
						'hireDate cannot be changed once the user has been created';
				}

				if (error.message) {
					throw error;
				}
				// Save oldEmail to update email in users_roles collection if needed
				request.body.oldEmail = request.body.email ? user.email : null;

				if (user.image) {
					if (imagePath) {
						fs.unlink(user.image, error => {});
					} else {
						imagePath = user.image;
					}
				}
				return schema.updateOne(
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
					let error = new Error(`${toCapitalCase(key)} not found`);
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
				response.status(200).json({
					message: `${toCapitalCase(key)} updated successfully`
				});
			})
			.catch(error => {
				next(error);
			});
	};
};

exports.updateUserById = (schema, key) => {
	return (request, response, next) => {
		let imagePath = request.file ? request.file.path : null;

		if (request.body.password) {
			request.body.password = bcrypt.hashSync(
				request.body.password,
				saltRounds
			);
		}
		schema
			.findOne({ _id: request.params.id })
			.then(user => {
				let error = new Error();
				error.status = 403;
				error.message = null;

				if (!user) {
					error.status = 404;
					error.message = `${toCapitalCase(key)} not found`;
					throw error;
				} else if (request.body.password && user.tmpPassword) {
					error.message = `${toCapitalCase(
						key
					)} didn't activate his/her account yet`;
				} else if (
					request.body.email ||
					request.body.salary ||
					request.body.hireDate
				) {
					error.message = `${toCapitalCase(
						key
					)} doesn't has the permissions to update email, salary or hireDate`;
				}

				if (error.message) {
					throw error;
				}

				if (user.image) {
					if (imagePath) {
						fs.unlink(user.image, error => {});
					} else {
						imagePath = user.image;
					}
				}
				return schema.updateOne(
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
					let error = new Error(`${toCapitalCase(key)} not found`);
					error.status = 404;
					throw error;
				} else {
					response.status(200).json({
						message: `${toCapitalCase(key)} updated successfully`
					});
				}
			})
			.catch(error => {
				next(error);
			});
	};
};

exports.activateUser = (schema, key) => {
	return (request, response, next) => {
		let imagePath = request.file ? request.file.path : null;

		if (request.body.newPassword) {
			request.body.newPassword = bcrypt.hashSync(
				request.body.newPassword,
				saltRounds
			);
		}
		schema
			.findOne({ _id: request.params.id })
			.then(user => {
				let error = new Error();
				error.status = 403;
				error.message = null;

				if (!user) {
					error.status = 404;
					error.message = `${toCapitalCase(key)} not found`;
				} else if (user.password) {
					error.status = 200;
					error.message = 'Account is already activated';
				} else if (request.body.oldPassword !== user.tmpPassword) {
					error.message = 'oldPassword is incorrect';
				} else if (
					request.body.email ||
					request.body.salary ||
					request.body.hireDate
				) {
					error.message = `${toCapitalCase(
						key
					)} doesn't has the permissions to update email, salary or hireDate`;
				}

				if (error.message) {
					throw error;
				}

				if (user.image) {
					if (imagePath) {
						fs.unlink(user.image, error => {});
					} else {
						imagePath = user.image;
					}
				}
				return schema.updateOne(
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
					let error = new Error(`${toCapitalCase(key)} not found`);
					error.status = 404;
					throw error;
				} else {
					response.status(200).json({
						message: `${toCapitalCase(key)} updated successfully`
					});
				}
			})
			.catch(error => {
				next(error);
			});
	};
};

exports.deleteUser = (schema, key, keyId, msg) => {
	return (request, response, next) => {
		schema.findOne({ _id: request.body.id })
			.then(user => {
				if (!user) {
					let error = new Error(`${toCapitalCase(key)} not found`);
					error.status = 404;
					throw error;
				}
				request.body.email = user.email;
				request.body.image = user.image;
				return TransactionSchema.findOne({
					[keyId]: request.body.id,
					isReturnd: false
				});
			})
			.then(transaction => {
				if (transaction) {
					let error = new Error(msg);
					error.status = 409;
					throw error;
				}
				if (request.body.image) {
					fs.unlink(request.body.image, error => {});
				}
				return schema.deleteOne({ _id: request.body.id });
			})
			.then(data => {
				if (data.deletedCount == 0) {
					let error = new Error(`${toCapitalCase(key)} not found`);
					error.status = 404;
					throw error;
				} else {
					return UserRoleSchema.deleteOne({
						email: request.body.email
					});
				}
			})
			.then(data => {
				response
					.status(200)
					.json({ data: `${toCapitalCase(key)} deleted successfully` });
			})
			.catch(error => {
				next(error);
			});
	};
};
