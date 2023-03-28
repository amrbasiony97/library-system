const express = require('express');

const controller = require('../Controllers/memberController');
const validateMW = require('../Core/Validations/validateMW');
const validateMember = require('../Core/Validations/validateMember');
const multerMW = require('../Core/Multer/multerMW');
const { checkEmail } = require('../Core/Utilities/utilities');

const router = express.Router();

router
    .route('/members')
    .get(controller.getAllMembers)

module.exports = router;