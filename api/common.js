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
}

const common = {
    getRoles: asyncHandler(async (req, res) => {
        let result = await commonServices.readAllData(req, tables.mr, '*', {
            isActive: 1,
        })

        if (result.length > 0) {
            return resp.cResponse(req, res, resp.SUCCESS, con.common.SUCCESS, {
                records: result,
            })
        }

        return resp.cResponse(req, res, resp.SUCCESS, con.common.NO_RECORD, {
            records: [],
        })
    }),

    getCategory: asyncHandler(async (req, res) => {
        let result = await commonServices.readAllData(req, tables.mc, '*', {
            is_active: 'Active',
        })

        if (result.length > 0) {
            return resp.cResponse(req, res, resp.SUCCESS, con.common.SUCCESS, {
                records: result,
            })
        }

        return resp.cResponse(req, res, resp.SUCCESS, con.common.NO_RECORD, {
            records: [],
        })
    }),

    getSubCategory: asyncHandler(async (req, res) => {
        const body = req.body
        console.log(body)
        let result = await commonServices.readAllData(req, tables.msc, '*', {
            category_id: body.category_id,
            is_active: 'Active',
        })

        if (result.length > 0) {
            return resp.cResponse(req, res, resp.SUCCESS, con.common.SUCCESS, {
                records: result,
            })
        }
        return resp.cResponse(req, res, resp.SUCCESS, con.common.NO_RECORD, {
            records: [],
        })
    }),
}

module.exports = common
