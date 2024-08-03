const asyncHandler = require('../helpers/catch-async')
const resp = require('../helpers/response')
const con = require('../constants/index')
const commonServices = require('../services/common')
const nodemailer = require('nodemailer')
const moment = require('moment')
const helper = require('../helpers/common')
const uuid = require('uuid')
const jwtConfig = require('config').get('jwtConfig')
const app = require('config')
const jwt = require('jsonwebtoken')

const tables = {
    users: 'users',
    mr: 'master_roles',
    mc: 'master_category',
    msc: 'master_subcategories',
    mf: 'faq_subcategory',
}

const subcategory = {
    addSubCategory: asyncHandler(async (req, res) => {
        const body = req.body
        if (req.fileDetails) {
            const { original, small, large } = req.fileDetails;

            const existingCategory = await commonServices.readSingleData(
                req,
                tables.msc,
                '*',
                { service_name: body.service_name }
            )

            if (existingCategory.length > 0) {
                return resp.cResponse(
                    req,
                    res,
                    resp.BAD_REQUEST,
                    con.category.SUB_CATEGORY_EXISTS
                )
            }
            const data = {
                service_name: body.service_name,
                category_id: body.category_id,
                icon: small,
                service_cost: body.service_cost,
                description: body.service_description,
                est_time: body.est_time,
                rating: body.rating,
                is_active: "Active",
            }

            const inesrData = await commonServices.dynamicInsert(req, tables.msc, data);
            console.log(body.faq_ids)
            if (body.faq_ids && Array.isArray(body.faq_ids)) {
                const faqInsertPromises = body.faq_id.map(id => {
                    return  commonServices.dynamicInsert(req, tables.mf, {
                        sub_category_id: inesrData?.insertId,
                        faq_id: id
                    });
                });
                await Promise.all(faqInsertPromises);
            }

            if (inesrData) {
                return resp.cResponse(
                    req,
                    res,
                    resp.SUCCESS,
                    con.category.SUB_CATEGORY_ADDED,
                    {
                        inserted_Id: inesrData?.insertId,
                        icon: small,
                    }
                )
            } else {
                return resp.cResponse(
                    req,
                    res,
                    resp.BAD_REQUEST,
                    con.common.SOMETHING_WRONG
                )
            }
        } else {
            return resp.cResponse(
                req,
                res,
                resp.BAD_REQUEST,
                "Image upload failed"
            )
        }
    }),
}

module.exports = subcategory;