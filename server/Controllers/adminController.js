const mongoose = require('mongoose');

require('../Models/adminModel');
const AdminSchema = mongoose.model('admins');
const crudMW = require('../Core/Middlewares/crudMW');

exports.getAllAdmins = crudMW.getAllUsers(AdminSchema, 'admins');

exports.getAdminById = crudMW.getUserByID(AdminSchema, 'admin');

exports.addAdmin = crudMW.addUser(AdminSchema, 'admin');

exports.updateAdminByBasicAdmin = crudMW.updateUser(AdminSchema, 'admin');

exports.updateAdminById = crudMW.updateUserById(AdminSchema, 'admin');

exports.activateAdmin = crudMW.activateUser(AdminSchema, 'admin');

exports.deleteAdmin = crudMW.deleteAdmin(AdminSchema);
