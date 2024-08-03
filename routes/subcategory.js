const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validator = require('../middleware/joiValidator')
const reqValidator = require('../middleware/reqValidator')
const resp = require('../helpers/response')
const auth = require('../middleware/auth');
const uploadWithProcessing = require('../helpers/uploader')
const subcategory = require('../api/subcategory')


module.exports = (router) => {

    router.post('/addSubCategory', auth, uploadWithProcessing({ defaultDir: 'public/uploads/subcategory', resize: true, }),
        validator(Joi, {
            category_id: Joi.string().required().messages({
                'string.pattern.base': '"category_name" is required.',
            }),
            service_name: Joi.string().required().messages({
                'string.pattern.base': '"subcategory_name" is required.',
            }),
            description: Joi.string().required().messages({
                'string.pattern.base': '"description" is required.',
            }),
            service_cost: Joi.string()
                .pattern(/^\d+(\.\d{1,2})?$/)
                .required()
                .messages({
                    'string.base': '"service_cost" must be a string',
                    'string.empty': '"service_cost" cannot be an empty string',
                    'string.pattern.base': '"service_cost" must be a valid number with up to two decimal places',
                    'any.required': '"service_cost" is required'
                }),
            est_time: Joi.string().required().messages({
                'string.pattern.base': '"est_time" is required.',
            }),
        }),
        reqValidator, subcategory.addSubCategory
    )
}