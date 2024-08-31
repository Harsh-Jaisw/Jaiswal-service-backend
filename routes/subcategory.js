const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validator = require('../middleware/joiValidator');
const reqValidator = require('../middleware/reqValidator');
const resp = require('../helpers/response');
const auth = require('../middleware/auth');
const uploadWithProcessing = require('../helpers/uploader');
const subcategory = require('../api/subcategory');

module.exports = (router) => {
  router.post(
    '/addSubCategory',
    auth,
    uploadWithProcessing({
      defaultDir: 'public/uploads/subcategory',
      resize: true,
    }),
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
          'any.required': '"service_cost" is required',
        }),
      est_time: Joi.string().required().messages({
        'string.pattern.base': '"est_time" is required.',
      }),
    }),
    reqValidator,
    subcategory.addSubCategory,
  );
  router.post(
    '/updateSubCategory', // Assuming ID is passed as a route parameter
    auth,
    uploadWithProcessing({
      defaultDir: 'public/uploads/subcategory',
      resize: true,
    }),
    validator(Joi, {
      category_id: Joi.string().required().messages({
        'string.base': '"category_id" must be a string',
        'string.empty': '"category_id" cannot be an empty string',
        'any.required': '"category_id" is required',
      }),
      service_name: Joi.string().optional().messages({
        'string.base': '"service_name" must be a string',
      }),
      description: Joi.string().optional().messages({
        'string.base': '"description" must be a string',
      }),
      service_cost: Joi.string()
        .pattern(/^\d+(\.\d{1,2})?$/)
        .optional()
        .messages({
          'string.base': '"service_cost" must be a string',
          'string.pattern.base': '"service_cost" must be a valid number with up to two decimal places',
        }),
      est_time: Joi.string().optional().messages({
        'string.base': '"est_time" must be a string',
      }),
      rating: Joi.number().min(0).max(5).optional().messages({
        'number.base': '"rating" must be a number',
        'number.min': '"rating" must be at least 0',
        'number.max': '"rating" must be at most 5',
      }),
      is_active: Joi.string().valid('Active', 'Inactive').optional().messages({
        'string.base': '"is_active" must be a string',
        'any.only': '"is_active" must be either "Active" or "Inactive"',
      }),
    }),
    reqValidator,
    subcategory.updateSubCategory,
  );

  router.post(
    '/deleteSubCategory',
    auth,
    validator(Joi, {
      category_id: Joi.string().required().messages({
        'string.pattern.base': '"category_id" is required.',
      }),
    }),
    reqValidator,
    subcategory.deleteSubCategory,
  );

  router.post(
    '/getAllSubCategories',
    validator(Joi, {
      pageNumber: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(10),
      category_id: Joi.string().optional().allow(''),
      search: Joi.string().allow(''),
      sortBy: Joi.string().valid('service_name', 'service_cost', 'rating', 'est_time'),
      sortOrder: Joi.string().valid('asc', 'desc'),
    }),
    reqValidator,
    subcategory.getAllSubCategories,
  );
};
