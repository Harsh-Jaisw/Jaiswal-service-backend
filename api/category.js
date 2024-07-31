const asyncHandler = require("../helpers/catch-async")
const resp = require('../helpers/response');
const con = require('../constants/index');
const commonServices = require('../services/common');
const nodemailer = require("nodemailer");
const moment = require('moment');
const helper = require('../helpers/common');
const uuid = require('uuid');
const jwtConfig = require("config").get("jwtConfig");
const app = require("config");
const jwt = require('jsonwebtoken');

const tables = {
    users: "users",
    mr: "master_roles",
    mc: 'master_category',
    msc: 'master_subcategories'
}

const category = {

    addCategory: asyncHandler(async (req, res) => {
        const body = req.body;
        if (req.file && req.file.thumbnails) {
            const { small } = req.file.thumbnails;

            const existingCategory = await commonServices.readSingleData(req, tables.mc, '*', { 'category_name': body.category_name, });

            if (existingCategory.length > 0) {
                return resp.cResponse(req, res, resp.BAD_REQUEST, con.common.CATEGORY_EXISTS);
            }
            let result = await commonServices.dynamicInsert(req, tables.mc, {
                category_name: req.body.category_name,
                icon: small,
            });

            if (result) {
                return resp.cResponse(req, res, resp.CREATED, con.common.SUCCESS, {
                    inserted_Id: result?.insertId,
                    icon: small,
                });
            }
        } else {
            return resp.cResponse(req, res, resp.BAD_REQUEST, con.common.SOMETHING_WRONG);
        }
    })
}

module.exports = category;