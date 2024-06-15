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
    mr:"master_roles"
}

const common = {
    getRoles: asyncHandler(async (req, res) => {
        let Result = await commonServices.readAllData(req, tables.mr, '*', {});
        return resp.cResponse(req, res, resp.SUCCESS, Result);
    })

}

module.exports = common;