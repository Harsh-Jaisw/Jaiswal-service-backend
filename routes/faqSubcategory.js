const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validator = require('../middleware/joiValidator');
const reqValidator = require('../middleware/reqValidator');
const resp = require('../helpers/response');
const auth = require('../middleware/auth');
const faqtosubcategory = require('../api/faqtosubcategory');

module.exports = (router) => {
  router.post(
    '/addFaqToSubCategory',
    validator(Joi, {
      faq_ids: Joi.array().items(Joi.number()).required().messages({
        'array.base': '"faq_ids" must be an array.',
        'array.includes': '"faq_ids" must only contain numbers.',
        'any.required': '"faq_ids" is required.',
      }),
      sub_category_id: Joi.string().required().messages({
        'string.empty': '"sub_category_id" cannot be an empty string.',
        'any.required': '"sub_category_id" is required.',
      }),
    }),
    faqtosubcategory.addFaqToSubCategory,
  );

  router.post(
    '/updateFaqInSubCategory',
    validator(Joi, {
      faq_ids: Joi.array().items(Joi.number()).required().messages({
        'array.base': '"faq_ids" must be an array.',
        'array.includes': '"faq_ids" must only contain numbers.',
        'any.required': '"faq_ids" is required.',
      }),
      sub_category_id: Joi.string().required().messages({
        'string.empty': '"sub_category_id" cannot be an empty string.',
        'any.required': '"sub_category_id" is required.',
      }),
    }),
    faqtosubcategory.updateFaqInSubCategory,
  );

  router.post(
    '/removeFaqFromSubCategory',
    validator(Joi, {
      sub_category_id: Joi.string().required().messages({
        'string.empty': '"sub_category_id" cannot be an empty string.',
        'any.required': '"sub_category_id" is required.',
      }),
      faq_id: Joi.number().required().messages({
        'number.base': '"faq_id" must be a number.',
        'any.required': '"faq_id" is required.',
      }),
    }),
    faqtosubcategory.removeFaqFromSubCategory,
  );
};
