const account = require("../api/account");
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validator = require("../middleware/joiValidator");
const reqValidator = require('../middleware/reqValidator');
const resp = require('../helpers/response');
const auth = require('../middleware/auth');

module.exports = (router) => {

    // router.post("/login", 
    //     validator(Joi, {
    //     email: Joi.string()
    //         .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    //         .required()
    //         .allow('')
    //         .messages({
    //             'string.pattern.base': 'email must be a valid email'
    //         }),
    //     password: Joi.string()
    //         .min(8) // Minimum length of 8 characters
    //         .max(12) // Maximum length of 30 characters (adjust as needed)
    //         .regex(/^(?!.* )(?=.*\d)(?=.*[!@#$%^&*_])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
    //         .messages({
    //             'string.min': 'Password is too short. It must be at least {{#limit}} characters long.',
    //             'string.max': 'Password is too long. It must not exceed {{#limit}} characters.',
    //             'string.pattern.base': 'Password is invalid. It must contain at least one digit, one uppercase letter, one lowercase letter, one special character, and be 8 to 30 characters long.',
    //         }).optional().allow(''),
    //     device_token: Joi.string().optional().allow("").allow(null),
    // }), reqValidator, account.login);

    router.post("/signUp", validator(Joi, {
        email: Joi.string()
            .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
            .required()
            .allow('')
            .messages({
                'string.pattern.base': 'email must be a valid email'
            }),
        mobile_number: Joi.string()
            .regex(/^[0-9]{10}$/)
            .required()
            .messages({ 'string.pattern.base': 'Phone number must be a 10-digit number', }),
        password: Joi.string()
            .min(8) // Minimum length of 8 characters
            .max(30) // Maximum length of 30 characters (adjust as needed)
            .regex(/^(?!.* )(?=.*\d)(?=.*[!@#$%^&*_])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
            .messages({
                'string.min': 'Password is too short. It must be at least {{#limit}} characters long.',
                'string.max': 'Password is too long. It must not exceed {{#limit}} characters.',
                'string.pattern.base': 'Password is invalid. It must contain at least one digit, one uppercase letter, one lowercase letter, one special character, and be 8 to 30 characters long.',
            }).required(),
        first_name: Joi.string().trim().required().messages({
            'string.base': 'Please enter the valid Customer first name',
            'string.empty': 'Customer first name should not be empty',
            'any.required': 'Please enter the value for Customer first name',
        }),
        last_name: Joi.string().trim().messages({
            'string.base': 'Please enter the valid Customer last name',
            'string.empty': 'Customer last name should not be empty',
            'any.required': 'Please enter the value for Customer last name',
        }),
    }), reqValidator, account.signUp);

    router.post("/sendOtp", validator(Joi, {
        email: Joi.string()
            .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
            .required()
            .messages({
                'string.pattern.base': 'email must be a valid email'
            }),
    }), reqValidator, account.sendotp);

    router.post("/verifyOtp", validator(Joi, {
        email: Joi.string()
            .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
            .required()
            .messages({
                'string.pattern.base': 'email must be a valid email'
            }),
        otp: Joi.string()
            .regex(/^[0-9]{6}$/)
            .required()
            .messages({
                'string.pattern.base': 'Otp must be a 6 digit number',
            }),
        device_token: Joi.string().optional().allow("").allow(null),
    }), reqValidator, account.verifyOtp);

    router.post('/logout', account.logout);

    router.post("/refreshToken", auth, reqValidator, account.refreshToken);

}