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
    // Get all employees if there is no firstname nor lastname were entered
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
