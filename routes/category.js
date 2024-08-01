const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validator = require('../middleware/joiValidator')
const reqValidator = require('../middleware/reqValidator')
const resp = require('../helpers/response')
const auth = require('../middleware/auth')
const category = require('../api/category')
const uploadWithProcessing = require('../helpers/uploader')

module.exports = (router) => {
    router.post(
        '/addCategory',
        auth,
        uploadWithProcessing({
            defaultDir: 'public/uploads/category',
            resize: true,
        }),
        validator(Joi, {
            category_name: Joi.string().required().messages({
                'string.pattern.base': '"category_name" is required.',
            }),
        }),
        reqValidator,
        category.addCategory
    ),
        router.post(
            '/updateCategory',
            auth,
            uploadWithProcessing({
                defaultDir: 'public/uploads/category',
                resize: true,
            }),
            validator(Joi, {
                category_id: Joi.string().required().messages({
                    'string.pattern.base': '"category_id" is required.',
                }),
                category_name: Joi.string().required().messages({
                    'string.pattern.base': '"category_name" is required.',
                }),
                status: Joi.string()
                    .valid('Active', 'Inactive')
                    .required()
                    .messages({
                        'string.base': '"status" must be a string.',
                        'string.empty': '"status" is required.',
                        'any.only':
                            '"status" must be either "Active" or "Inactive".',
                        'any.required': '"status" is required.',
                    }),
            }),
            reqValidator,
            category.updateCategory
        ),
        router.post(
            '/updateCategoryStatus',
            auth,
            validator(Joi, {
                category_id: Joi.string().required().messages({
                    'string.base': '"category_id" must be a string.',
                    'string.empty': '"category_id" is required.',
                    'any.required': '"category_id" is required.',
                }),
                status: Joi.string()
                    .valid('Active', 'Inactive')
                    .required()
                    .messages({
                        'string.base': '"status" must be a string.',
                        'string.empty': '"status" is required.',
                        'any.only':
                            '"status" must be either "Active" or "Inactive".',
                        'any.required': '"status" is required.',
                    }),
            }),
            reqValidator,
            category.updateCategoryStatus
        )
}
