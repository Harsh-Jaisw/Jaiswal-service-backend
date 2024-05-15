const asyncHandler = require("../helpers/catch-async")
const resp = require('../helpers/response');
const con = require('../constants/index');
const commonServices = require('../services/common');
const nodemailer = require("nodemailer");
const moment = require('moment');

const tables = {
    users: "users",
}

const account = {

    signUp: asyncHandler(async (req, res) => {
        const body = req.body;
        let Result = await commonServices.readSingleData(req, tables.users, '*', { 'mobileNumber': body.mobileNumber, });
        console.log(Result) ;
        if (Result.length !== 0) {
            return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.ACCOUNT_ALREADY_EXIT);
        }

    }),

    login: asyncHandler(async (req, res) => {
        const body = req.body;
        let loginResults = await commonServices.readSingleData(req, tables.users, '*', { 'mobileNumber': body.mobileNumber, });
        if (loginResults.length == 0) {
            return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.NO_ACCOUNT);
        }
        return resp.cResponse(req, res, resp.SUCCESS, con.account.CREATED, { loginResults })
    }),


}

module.exports = account;
