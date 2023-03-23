const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
require('../Models/adminModel');
require('../Models/userRoleModel');
const AdminSchema = mongoose.model('admins');
const UserRoleSchema = mongoose.model('users_roles');
const { generatePassword } = require('../Core/Utilities/utilities');
const saltRounds = 10;

exports.getAllAdmins = (request, response, next) => {
    // Get all admins if there is no firstname nor lastname were entered
	request.query.firstname = request.query.firstname || '';
	request.query.lastname = request.query.lastname || '';

	AdminSchema.find({
		firstName: { $regex: request.query.firstname, $options: 'i' },
		lastName: { $regex: request.query.lastname, $options: 'i' }
	})
		.then(admins => {
			response.status(200).json({ admins });
		})
		.catch(error => {
			next(error);
		});
}

exports.getAdminById = (request, response, next) => {
	AdminSchema.findOne({ _id: request.params.id })
		.then(admin => {
			if (admin) {
				response.status(200).json({ admin });
			} else {
				let error = new Error('Admin not found');
				error.status = 404;
				next(error);
			}
		})
		.catch(error => {
			next(error);
		});
};

exports.addAdmin = (request, response, next) => {
	const imagePath = request.file ? request.file.path : null;

	new AdminSchema({
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
		.then(adminData => {
			request.body.adminData = adminData;
			return new UserRoleSchema({
				email: request.body.email,
				role: 'admin'
			}).save();
		})
		.then(userRoleData => {
			response.status(201).json({
				adminData: request.body.adminData,
				userRoleData
			});
		})
		.catch(error => {
			next(error);
		});
};

exports.updateAdminByBasicAdmin = (request, response, next) => {
	let imagePath = request.file ? request.file.path : null;

	if (request.body.password) {
		request.body.password = bcrypt.hashSync(
			request.body.password,
			saltRounds
		);
	}
	AdminSchema.findOne({ _id: request.body.id })
		.then(admin => {
			let error = new Error();
			error.status = 403;
			error.message = null;

			if (!admin) {
				error.status = 404;
				error.message = 'Admin not found';
			} else if (request.body.password && admin.tmpPassword) {
				error.message = "Admin didn't activate his/her account yet";
			} else if (request.body.hireDate) {
				error.message =
					'hireDate cannot be changed once the user has been created';
			}

			if (error.message) {
				throw error;
			}
			// Save oldEmail to update email in users_roles collection if needed
			request.body.oldEmail = request.body.email ? admin.email : null;

			if (admin.image) {
				if (imagePath) {
					fs.unlink(admin.image, error => {});
				} else {
					imagePath = admin.image;
				}
			}
			return AdminSchema.updateOne(
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
				let error = new Error('Admin not found');
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
				.json({ message: 'Admin updated successfully' });
		})
		.catch(error => {
			next(error);
		});
};

exports.updateAdminById = (request, response, next) => {
	let imagePath = request.file ? request.file.path : null;

	if (request.body.password) {
		request.body.password = bcrypt.hashSync(
			request.body.password,
			saltRounds
		);
	}
	AdminSchema.findOne({ _id: request.params.id })
		.then(admin => {
			let error = new Error();
			error.status = 403;
			error.message = null;

			if (!admin) {
				error.status = 404;
				error.message = 'Admin not found';
			}
			else if (request.body.password && admin.tmpPassword) {
				error.message = "Admin didn't activate his/her account yet";
			}
			else if (
				request.body.email ||
				request.body.salary ||
				request.body.hireDate
			) {
				error.message =
					"Admin doesn't has the permissions to update email, salary or hireDate";
			}

			if (error.message) {
				throw error;
			}

			if (admin.image) {
				if (imagePath) {
					fs.unlink(admin.image, error => {});
				} else {
					imagePath = admin.image;
				}
			}
			return AdminSchema.updateOne(
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
				let error = new Error('Admin not found');
				error.status = 404;
				throw error;
			} else {
				response
					.status(200)
					.json({ message: 'Admin updated successfully' });
			}
		})
		.catch(error => {
			next(error);
		});
};

exports.activateAdmin = (request, response, next) => {
	let imagePath = request.file ? request.file.path : null;

	if (request.body.newPassword) {
		request.body.newPassword = bcrypt.hashSync(
			request.body.newPassword,
			saltRounds
		);
	}
	AdminSchema.findOne({ _id: request.params.id })
		.then(admin => {
			let error = new Error();
			error.status = 403;
			error.message = null;

			if (!admin) {
				error.status = 404;
				error.message = 'Admin not found';
			}
			else if (admin.password) {
				error.status = 200;
				error.message = 'Account is already activated';
			}
			else if (request.body.oldPassword !== admin.tmpPassword) {
				error.message = 'oldPassword is incorrect';
			}
			else if (
				request.body.email ||
				request.body.salary ||
				request.body.hireDate
			) {
				error.message =
					"Admin doesn't has the permissions to update email, salary or hireDate";
			}

			if (error.message) {
				throw error;
			}

			if (admin.image) {
				if (imagePath) {
					fs.unlink(admin.image, error => {});
				} else {
					imagePath = admin.image;
				}
			}
			return AdminSchema.updateOne(
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
				let error = new Error('Admin not found');
				error.status = 404;
				throw error;
			} else {
				response
					.status(200)
					.json({ message: 'Admin updated successfully' });
			}
		})
		.catch(error => {
			next(error);
		});
};
