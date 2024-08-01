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
    mf: 'master_faq',
}

const faq = {
    addFaq: asyncHandler(async (req, res) => {
        const body = req.body
        const newfaq = await commonServices.dynamicInsert(req, tables.mf, body)

        if (newfaq) {
            return resp.cResponse(req, res, resp.CREATED, con.faq.FAQ_CREATED, {
                inserted_Id: newfaq?.insertId,
            })
        } else {
            return resp.cResponse(
                req,
                res,
                resp.BAD_REQUEST,
                con.faq.FAQ_NOT_CREATED
            )
        }
    }),
    getFaq: asyncHandler(async (req, res) => {
        const body = req.body

        const pagination = {
            page: parseInt(body.page || 1),
            pageSize: parseInt(body.pageSize || 10),
        }
        const sort = body.sort || null
        const filters = body.filters || {}

        const faq = await commonServices.getDataWithFilterAndPagination(
            req,
            tables.mf,
            filters,
            pagination,
            sort
        )

        if (faq) {
            return resp.cResponse(
                req,
                res,
                resp.SUCCESS,
                con.common.RECORD_SUCCESS,
                faq
            )
        } else {
            return resp.cResponse(
                req,
                res,
                resp.BAD_REQUEST,
                con.common.NO_RECORD
            )
        }
    }),
    updateFaq: asyncHandler(async (req, res) => {
        const body = req.body
        const updateData = {}

        if (body.question) {
            updateData.question = body.question
        }
        if (body.answer) {
            updateData.answer = body.answer
        }
        if (body.category_id) {
            updateData.category_id = body.category_id
        }
        if (body.subcategory_id) {
            updateData.subcategory_id = body.subcategory_id
        }

        const faq = await commonServices.dynamicUpdate(
            req,
            tables.mf,
            updateData,
            {
                id: body.faq_id,
            }
        )

        if (faq) {
            return resp.cResponse(req, res, resp.SUCCESS, con.faq.FAQ_UPDATED)
        } else {
            return resp.cResponse(
                req,
                res,
                resp.BAD_REQUEST,
                con.faq.FAQ_NOT_UPDATED
            )
        }
    }),
    deleteFaq: asyncHandler(async (req, res) => {
        const body = req.body
        const faq = await commonServices.dynamicDelete(req, tables.mf, {
            id: body.faq_id,
        })
        if (faq) {
            return resp.cResponse(req, res, resp.SUCCESS, con.faq.FAQ_DELETED)
        } else {
            return resp.cResponse(
                req,
                res,
                resp.BAD_REQUEST,
                con.faq.FAQ_NOT_DELETED
            )
        }
    }),
}

module.exports = faq
