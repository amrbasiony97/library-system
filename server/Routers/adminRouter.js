const express = require('express');

const controller = require('../Controllers/adminController');
const validateMW = require('../Core/Validations/validateMW');
const validateAdmin = require('../Core/Validations/validateStaff');
const multerMW = require('../Core/Multer/multerMW');
const { checkEmail } = require('../Core/Utilities/utilities');

const router = express.Router();

router
    .route('/admins')
    .get(controller.getAllAdmins)
    .post(
        multerMW,
        checkEmail,
        validateAdmin.validatePostArray,
        validateMW,
        controller.addAdmin
    )
    .patch(
        multerMW,
        checkEmail,
        validateAdmin.validateAdminPatchArray,
        validateMW,
        controller.updateAdminByBasicAdmin
    )

module.exports = router;
