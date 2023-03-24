const mongoose = require('mongoose');

require('../../Models/userRoleModel');
const UserRoleSchema = mongoose.model('users_roles');

exports.toCapitalCase = str =>
    str.charAt(0).toUpperCase() +
    str.substring(1, str.length);

exports.manipulateImagePath = str =>
    str?.split('/')[1].charAt(0).toUpperCase() +
    str?.split('/')[1].substring(1, str.length - 1);

exports.checkEmail = (request, response, next) => {
    UserRoleSchema.findOne({ email: request.body.email })
        .then(user => {
            if (user) {
                let error = new Error('Email already exists');
                error.status = 409;
                next(error);
            } else next();
        })
        .catch(error => {
            next(error);
        });
};

exports.generatePassword = length => {
    let password = '',
        charCode;

    // exclude backslash, backtick, single and double quotes
    let preventChars = [34, 39, 92, 96];
    for (let char = 0; char < 4; char++) {
        if (char % 4 == 0) {
            charCode = Math.floor(Math.random() * 10 + 48);
        } // include numbers
        else if (char % 4 == 1) {
            charCode = Math.floor(Math.random() * 26 + 65);
        } // include capital letters
        else if (char % 4 == 2) {
            charCode = Math.floor(Math.random() * 26 + 97);
        } // include small letters
        else {
            charCode =
                Math.floor(Math.random() * 15 + 33) ||
                Math.floor(Math.random() * 7 + 58) ||
                Math.floor(Math.random() * 6 + 91) ||
                Math.floor(Math.random() * 4 + 123);
        } // include special characters
        if (!preventChars.includes(charCode)) {
            password += String.fromCharCode(charCode);
        }
    }
    while (password.length < length) {
        charCode =
            Math.floor(Math.random() * 59 + 33) ||
            Math.floor(Math.random() * 34 + 93);
        if (!preventChars.includes(charCode)) {
            password += String.fromCharCode(charCode);
        }
    }
    return password;
};
