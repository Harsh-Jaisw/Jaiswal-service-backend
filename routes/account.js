const account = require("../api/account");
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validator = require("../middleware/joiValidator");
const reqValidator = require('../middleware/reqValidator');
const resp = require('../helpers/response');

module.exports = (router) => {

    router.post("/login", validator(Joi, {
        phone_number: Joi.string()
            .regex(/^[0-9]{10}$/)
            .required()
            .messages({ 'string.pattern.base': 'Phone number must be a 10-digit number', }),
        password: Joi.string()
            .min(8) // Minimum length of 8 characters
            .max(12) // Maximum length of 30 characters (adjust as needed)
            .regex(/^(?!.* )(?=.*\d)(?=.*[!@#$%^&*_])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
            .messages({
                'string.min': 'Password is too short. It must be at least {{#limit}} characters long.',
                'string.max': 'Password is too long. It must not exceed {{#limit}} characters.',
                'string.pattern.base': 'Password is invalid. It must contain at least one digit, one uppercase letter, one lowercase letter, one special character, and be 8 to 30 characters long.',
            }).optional().allow(''),
    }), reqValidator, account.login);

    router.post("/signUp", validator(Joi, {
        mobileNumber: Joi.string()
            .regex(/^[0-9]{10}$/)
            .required()
            .messages({ 'string.pattern.base': 'Phone number must be a 10-digit number', }),
    }), reqValidator, account.signUp);

}