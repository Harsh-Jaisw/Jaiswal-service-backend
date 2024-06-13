const asyncHandler = require("../helpers/catch-async")
const resp = require('../helpers/response');
const con = require('../constants/index');
const commonServices = require('../services/common');
const nodemailer = require("nodemailer");
const moment = require('moment');
const helper = require('../helpers/common');
const uuid = require('uuid');

const tables = {
    users: "users",
}

const account = {

    signUp: asyncHandler(async (req, res) => {
        const body = req.body;
        let Result = await commonServices.readSingleData(req, tables.users, '*', { 'mobileNumber': body.mobileNumber, });

        if (Result.length !== 0) {
            return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.ACCOUNT_ALREADY_EXIT);
        }

        let insertData = {
            mobileNumber: body.mobileNumber,
            password: await helper.encryptData(body.password),
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

    sendotp: asyncHandler(async (req, res) => {
        const body = req.body;

        let loginResults = await commonServices.readSingleData(req, tables.users, '*', { 'email': body.email });
        console.log(loginResults)

        if (loginResults.length > 0) {
            return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.ACCOUNT_ALREADY_EXIT);
        }
        console.log("hello")
        if ((loginResults.length > 0) && (loginResults[0].status === "Active")) {
            return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.ALREADY_ACTIVE);
        }
        console.log('Heyyy')
        let NewOtp = await helper.generateOtp()

        let insertData = {
            uid: uuid.v1(),
            email: body.email,
            otp: NewOtp,
            status: "Inactive",
        }

        console.log(insertData)

        let info = {
            from: '"harikrushnamultimedia@gmail.com"',
            to: body.email,
            subject: ` Hello, User : ${body.email},`,
            text: `Hello,Mr/Mrs : ${body.email}, Thank you. Connecting with us.`,
            html: `
                 <body style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px;">
                   <div style="background-color: #ffffff; max-width: 600px; margin: auto; border-radius: 10px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                     <h1 style="color: #333;">We Are Here to Assist You!</h1>
                     <p style="color: #555; font-size: 16px;">Dear ${NewOtp},</p>
                     <p style="color: #555; font-size: 16px;">Thank you for contacting with us.</p>
                     <p style="color: #555; font-size: 16px;">If you have any questions or need assistance, please feel free to contact us:</p>
                     <p style="color: #555; font-size: 16px;">
                       <i class="fas fa-phone-alt"></i> Phone: <a href="tel:+919824229989" style="color: #007bff; text-decoration: none;"> +91 9824229989</a>
                     </p>
                     <p style="color: #555; font-size: 16px;">
                       <i class="far fa-envelope"></i> Email: <a href="mailto:harikrushnamultimedia@gmail.com" style="color: #007bff; text-decoration: none;">harikrushnamultimedia@gmail.com</a>
                     </p>
                     <p style="color: #555; font-size: 16px;">Website: <a href="https://shreejigraphic.com/" style="color: #007bff; text-decoration: none;">www.shreejigraphic.com</a></p>
                     <p style="color: #555; font-size: 16px; margin-top: 20px;">Thank you for choosing our platform!</p>
                   </div>
                 </body>
                `,
        };

        await helper.sendMail(info);
        let Result = await commonServices.dynamicInsert(req, tables.users, insertData);
        console.log(Result)
        return resp.cResponse(req, res, resp.SUCCESS, con.account.OTP_SENT);

    }),
    verifyOtp: asyncHandler(async (req, res) => {
        const body = req.body;
        let Result = await commonServices.readSingleData(req, tables.users, '*', { 'email': body.email, 'otp': body.otp, });
        if (Result.length == 0) {
            return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.INVALID_OTP);
        }
        let updateData = {
            status: "Active",
            otp: null,
        }
        await commonServices.dynamicUpdate(req, tables.users, updateData, { 'email': body.email, 'otp': body.otp, });
        return resp.cResponse(req, res, resp.SUCCESS, con.account.OTP_VERIFIED);
    })

}

module.exports = account;
