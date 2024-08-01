const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validator = require('../middleware/joiValidator')
const reqValidator = require('../middleware/reqValidator')
const resp = require('../helpers/response')
const auth = require('../middleware/auth')
const faq = require('../api/faq')

module.exports = (router) => {
    router.post(
        '/addFaq',
        validator(Joi, {
            question: Joi.string().required().messages({
                'string.pattern.base': '"question" is required.',
            }),
            answer: Joi.string().required().messages({
                'string.pattern.base': '"answer" is required.',
            }),
            category_id: Joi.string().required().messages({
                'string.pattern.base': '"category_id" is required.',
            }),
            subcategory_id: Joi.string().required().messages({
                'string.pattern.base': '"subcategory_id" is required.',
            }),
        }),
        reqValidator,
        faq.addFaq
    ),
        router.post(
            '/getFaq',
            validator(Joi, {
                page: Joi.number().integer().min(1).default(1),
                pageSize: Joi.number().integer().min(1).default(10),
                sort: Joi.object({
                    column: Joi.string().allow(''),
                    direction: Joi.string().valid('ASC', 'DESC', '').allow(''),
                }).default({column: '', direction: ''}),
                filters: Joi.object({
                    question: Joi.string().allow(''),
                    category_id: Joi.string().allow(''),
                }).default({question: '', category_id: ''}),
            }),
            reqValidator,
            faq.getFaq
        ),
        router.post(
            '/updateFaq',
            validator(Joi, {
                faq_id: Joi.string().required().messages({
                    'string.pattern.base': '"faq_id" is required.',
                }),
                question: Joi.string().allow('').messages({
                    'string.pattern.base': '"question" is required.',
                }),
                answer: Joi.string().allow('').messages({
                    'string.pattern.base': '"answer" is required.',
                }),
                category_id: Joi.string().allow('').messages({
                    'string.pattern.base': '"category_id" is required.',
                }),
                subcategory_id: Joi.string().allow('').messages({
                    'string.pattern.base': '"subcategory_id" is required.',
                }),
            }),
            faq.updateFaq
        ),
        router.post(
            '/deleteFaq',
            validator(Joi, {
                faq_id: Joi.string().required().messages({
                    'string.pattern.base': '"faq_id" is required.',
                }),
            }),
            faq.deleteFaq
        )
}
