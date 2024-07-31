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

    // addCategory: asyncHandler(async (req, res) => {

    //     let result = await commonServices.dynamicInsert(req, tables.mc, {
    //         category_name: req.body.category_name,
    //         icon: req.body.icon,
    //     });
    //     console.log(result)
    //     if (result) {
    //         return resp.cResponse(req, res, resp.CREATED, con.common.SUCCESS, {
    //             inserted_Id: result?.insertId
    //         });
    //     }

    //     return resp.cResponse(req, res, resp.BAD_REQUEST, con.common.SOMETHING_WRONG, {
    //         records: []
    //     });
    // })


    addCategory: asyncHandler(async (req, res) => {
        // Ensure file processing was successful and thumbnails are available
        if (req.file && req.file.thumbnails) {
            const { small, large } = req.file.thumbnails;

            // Save category information including the file paths
            let result = await commonServices.dynamicInsert(req, tables.mc, {
                category_name: req.body.category_name,
                icon: small,
                // small_thumbnail: small,
                // large_thumbnail: large
            });

            console.log(result);
            if (result) {
                return resp.cResponse(req, res, resp.CREATED, con.common.SUCCESS, {
                    inserted_Id: result?.insertId,
                    icon: small,
                });
            }
        } else {
            return resp.cResponse(req, res, resp.BAD_REQUEST, con.common.SOMETHING_WRONG, {
                records: []
            });
        }
    })
}

module.exports = category;