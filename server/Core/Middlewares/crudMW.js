const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');

require('../../Models/userRoleModel');
require('../../Models/transactionModel');
const UserRoleSchema = mongoose.model('users_roles');
const TransactionSchema = mongoose.model('transactions');
const { toCapitalCase } = require('../../Core/Utilities/utilities');
const saltRounds = 10;

exports.getAllDocuments = (
	schema,
	key,
	projectObj,
	filterFunction,
	sortFunction
) => {
	return (request, response, next) => {
		const filterObj = filterFunction(request);
		const sortObj = sortFunction(request);

		schema
			.aggregate([
				{ $project: projectObj },
				{ $match: filterObj },
				{ $sort: sortObj }
			])
			.exec()
			.then(data => {
				const results = paginatedResults(data, request, key);
				response.status(200).json({ results });
			})
			.catch(error => {
				next(error);
			});
	};
};

const paginatedResults = (data, request, key) => {
	const page = parseInt(request.query.page) || 1;
	const limit = parseInt(request.query.limit) || 999999;

	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	const results = {};

	if (endIndex < data.length) {
		results.next = {
			page: page + 1,
			limit: limit
		};
	}

	if (startIndex > 0) {
		results.previous = {
			page: page - 1,
			limit: limit
		};
	}

	results[key] = data.slice(startIndex, endIndex);
	return results;
};

exports.getDocumentById = (schema, key, projectObj) => {
	return (request, response, next) => {
		schema
			.aggregate([
				{ $match: { _id: Number(request.params.id) } },
				{ $project: projectObj }
			])
			.exec()
			.then(data => {
				if (data.length > 0) {
					response.status(200).json({ [key]: data });
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

exports.addDocument = (schema, key, mapFunction) => {
	return async (request, response, next) => {
		const schemaObject = mapFunction(request);
		if (request.file) {
			schemaObject.image = request.file.path;
		}
		try {
			let data = await new schema({ ...schemaObject }).save();
			if (schemaObject.email) {
				let userRoleData = await new UserRoleSchema({
					email: schemaObject.email,
					role: key
				}).save();
			}
			let { _id, __v, ...result } = data.toObject();
			result.id = _id.toString();
			response.status(201).json({ [key]: result });
		} catch (error) {
			next(error);
		}
	};
};

exports.updateDocument = (schema, key, mapFunction) => {
	return async (request, response, next) => {
		const schemaObject = mapFunction(request);
		if (request.file) {
			schemaObject.image = request.file.path;
		}
		try {
			if (schemaObject.password) {
				schemaObject.password = await bcrypt.hash(
					schemaObject.password,
					saltRounds
				);
			}
			let data = await schema.findOne({ _id: request.body.id });

			let error = new Error();
			error.status = 403;
			error.message = null;

			if (!data) {
				error.status = 404;
				error.message = `${toCapitalCase(key)} not found`;
			} else if (schemaObject.password && data.tmpPassword) {
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
			if (schemaObject.email) {
				request.body.oldEmail = data.email;
			}

			// Remove old image if user updated a new image
			if (
				schemaObject.image &&
				(data.image !== DEFAULT_USER_IMAGE ||
					data.image !== DEFAULT_BOOK_IMAGE)
			) {
				fs.unlink(data.image, error => {});
			}
			let result = await schema.updateOne(
				{
					_id: request.body.id
				},
				{
					$set: { ...schemaObject }
				}
			);
			if (result.matchedCount === 0) {
				let error = new Error(`${toCapitalCase(key)} not found`);
				error.status = 404;
				throw error;
			} else if (schemaObject.email) {
				result = await UserRoleSchema.updateOne(
					{
						email: request.body.oldEmail
					},
					{
						$set: {
							email: schemaObject.email
						}
					}
				);
			}
			response.status(200).json({
				message: `${toCapitalCase(key)} updated successfully`
			});
		} catch (error) {
			next(error);
		}
	};
};

exports.updateDocumentById = (schema, key, mapFunction) => {
	return (request, response, next) => {
		const schemaObject = mapFunction(request);
		schemaObject.image = request.file ? request.file.path : null;

		if (schemaObject.password) {
			// TODO: remove hashSync and use async await to optimize performance
			schemaObject.password = bcrypt.hashSync(
				schemaObject.password,
				saltRounds
			);
		}
		schema
			.findOne({ _id: request.params.id })
			.then(data => {
				let error = new Error();
				error.status = 403;
				error.message = null;

				if (!data) {
					error.status = 404;
					error.message = `${toCapitalCase(key)} not found`;
					throw error;
				} else if (schemaObject.password && data.tmpPassword) {
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

				if (data.image) {
					if (schemaObject.image) {
						fs.unlink(data.image, error => {});
					} else {
						schemaObject.image = data.image;
					}
				}
				return schema.updateOne(
					{
						_id: request.params.id
					},
					{
						$set: { ...schemaObject }
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

exports.activateUser = (schema, key, mapFunction) => {
	return (request, response, next) => {
		const schemaObject = mapFunction(request);
		schemaObject.image = request.file ? request.file.path : null;

		if (schemaObject.password) {
			// TODO: remove hashSync and use async await to optimize performance
			schemaObject.password = bcrypt.hashSync(
				schemaObject.password,
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
					if (schemaObject.image) {
						fs.unlink(user.image, error => {});
					} else {
						schemaObject.image = user.image;
					}
				}
				return schema.updateOne(
					{
						_id: request.params.id
					},
					{
						$set: { ...schemaObject },
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

exports.deleteDocument = (schema, key, msg) => {
	return (request, response, next) => {
		schema
			.findOne({ _id: request.body.id })
			.then(data => {
				if (!data) {
					let error = new Error(`${toCapitalCase(key)} not found`);
					error.status = 404;
					throw error;
				}
				request.body.email = data.email;
				request.body.image = data.image;
				let keyId = `${key}Id`;

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
				response.status(200).json({
					message: `${toCapitalCase(key)} deleted successfully`
				});
			})
			.catch(error => {
				next(error);
			});
	};
};
