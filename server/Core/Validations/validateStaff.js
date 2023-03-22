const { body, param } = require('express-validator');

exports.validatePostArray = [
	body('firstName').isAlpha().withMessage('First name must be alphabetic'),
	body('lastName').isAlpha().withMessage('Last name must be alphabetic'),
	body('email').isEmail().withMessage('Email is not valid'),
	body('gender')
		.optional()
		.isIn(['male', 'female'])
		.withMessage('Gender must be either male or female'),
	body('birthDate')
		.optional()
		.isDate()
		.withMessage('Birth date must be a valid date'),
	body('salary').optional().isNumeric().withMessage('Salary must be a number')
];

exports.validateAdminPatchArray = [
	body('id').isNumeric().withMessage('Id must be a number'),
	body('firstName')
		.optional()
		.isAlpha()
		.withMessage('First name must be alphabetic'),
	body('lastName')
		.optional()
		.isAlpha()
		.withMessage('Last name must be alphabetic'),
	body('email').optional().isEmail().withMessage('Email is not valid'),
	body('password')
		.optional()
		.isStrongPassword()
		.withMessage('Password must be strong'),
	body('gender')
		.optional()
		.isIn(['male', 'female'])
		.withMessage('Gender must be either male or female'),
	body('birthDate')
		.optional()
		.isDate()
		.withMessage('Birth date must be a valid date'),
	body('salary').optional().isNumeric().withMessage('Salary must be a number')
];

exports.validatePatchArray = [
	param('id').isNumeric().withMessage('Id must be a number'),
	body('firstName')
		.optional()
		.isAlpha()
		.withMessage('First name must be alphabetic'),
	body('lastName')
		.optional()
		.isAlpha()
		.withMessage('Last name must be alphabetic'),
	body('password')
		.optional()
		.isStrongPassword()
		.withMessage('Password must be strong'),
	body('gender')
		.optional()
		.isIn(['male', 'female'])
		.withMessage('Gender must be either male or female'),
	body('birthDate')
		.optional()
		.isDate()
		.withMessage('Birth date must be a valid date'),
];

exports.validateId = [
	body('id').isNumeric().withMessage('Id should be number')
];
