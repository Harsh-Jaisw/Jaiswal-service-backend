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

    router.post("/sendMail", validator(Joi, {
        user: Joi.string().required().messages({
            'string.base': 'Please enter the valid user ',
            'string.empty': 'user should not be empty',
            'any.required': 'Please enter the value for user',
        }),
        password: Joi.string().required().messages({
            'string.base': 'Please enter the valid password ',
            'string.empty': 'password should not be empty',
            'any.required': 'Please enter the value for password',
        }),
        from: Joi.string().required().messages({
            'string.base': 'Please enter the valid from ',
            'string.empty': 'from should not be empty',
            'any.required': 'Please enter the value for from',
        }),
        to: Joi.string().required().messages({
            'string.base': 'Please enter the valid from ',
            'string.empty': 'from should not be empty',
            'any.required': 'Please enter the value for from',
        }),
        subject: Joi.string().required().messages({
            'string.base': 'Please enter the valid from ',
            'string.empty': 'from should not be empty',
            'any.required': 'Please enter the value for from',
        }),
        description: Joi.string().required().messages({
            'string.base': 'Please enter the valid from ',
            'string.empty': 'from should not be empty',
            'any.required': 'Please enter the value for from',
        }),
        html: Joi.string().required().messages({
            'string.base': 'Please enter the valid html ',
            'string.empty': 'from should not be html',
            'any.required': 'Please enter the value for html',
        }),
    }), reqValidator, account.sendMail);

    router.post("/addVisits", validator(Joi, {
        company_id: Joi.string().required().messages({
            'string.base': 'Please enter the valid company_id ',
            'string.empty': 'company_id should not be empty',
            'any.required': 'Please enter the value for company_id',
        }),
        page_visited: Joi.string().required().messages({
            'string.base': 'Please enter the valid company_id ',
            'string.empty': 'company_id should not be empty',
            'any.required': 'Please enter the value for company_id',
        }),
    }), reqValidator, account.addVisits);

    router.post("/sendMailSheerji", validator(Joi, {
        name: Joi.string().required().messages({
            'string.base': 'Please enter the valid name ',
            'string.empty': 'name should not be empty',
            'any.required': 'Please enter the value for name',
        }),
        email: Joi.string().required().messages({
            'string.base': 'Please enter the valid email ',
            'string.empty': 'email should not be empty',
            'any.required': 'Please enter the value for email',
        }),
    }), reqValidator, account.sendMailSheerji);

}