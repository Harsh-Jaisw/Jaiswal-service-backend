const common = require('../api/common');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validator = require('../middleware/joiValidator');
const reqValidator = require('../middleware/reqValidator');
const auth = require('../middleware/auth');

module.exports = (router) => {
  router.get('/getRoles', reqValidator, common.getRoles),
    router.get('/getCategory', reqValidator, common.getCategory),
    router.post(
      '/getSubCategory',
      validator(Joi, {
        category_id: Joi.string().required().messages({
          'string.pattern.base': '"category_id" is required.',
        }),
      }),
      reqValidator,
      common.getSubCategory,
    ),
    router.get('/getUsers', auth, reqValidator, common.getUsers);
  // validator(Joi, {
  //     page: Joi.number().integer().min(1).required(),
  //     limit: Joi.number().integer().min(1).required(),
  //     role: Joi.string().valid('user', 'Admin','member').required(),
  //     status: Joi.string().valid('Active', 'Inactive').required(),
  //     sortBy: Joi.string().valid('firstName', 'email', 'mobileNumber').default('firstName'),
  //     sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  //     search: Joi.string().allow('')
  // })
};
