
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validator = require("../middleware/joiValidator");
const reqValidator = require('../middleware/reqValidator');
const resp = require('../helpers/response');
const auth = require("../middleware/auth");
const category = require('../api/category');
const uploadWithProcessing = require('../helpers/uploader');


module.exports = (router) => {

    router.post('/addCategory', auth, uploadWithProcessing, validator(Joi, {
        category_name: Joi.string()
            .required()
            .messages({
                'string.pattern.base': '"category_name" is required.'
            })
    }), reqValidator, category.addCategory)


}