const common = require("../api/common");
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validator = require("../middleware/joiValidator");
const reqValidator = require('../middleware/reqValidator');
const resp = require('../helpers/response');
const auth = require("../middleware/auth");

module.exports = (router) => {

    router.get('/getRoles', reqValidator, common.getRoles),

        router.get('/getCategory', reqValidator, common.getCategory),

        router.post('/getSubCategory', validator(Joi, {
            category_id: Joi.string()
                .required()
                .messages({
                    'string.pattern.base': '"category_id" is required.'
                }),
        }), reqValidator, common.getSubCategory)


}