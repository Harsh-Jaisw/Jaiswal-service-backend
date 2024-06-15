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
    ud:"users_devices"
}

const account = {

    signUp: asyncHandler(async (req, res) => {
        const body = req.body;
        let Result = await commonServices.readSingleData(req, tables.users, '*', { 'email': body.email, });

        if (Result.length == 0) {
            return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.NO_ACCOUNT);
        }
        const newPassword = await helper.encryptData(body.password);
        console.log(newPassword)
        let updateData = {
            mobileNumber: body.mobile_number,
            password: newPassword,
            firstName: body.first_name,
            lastName: body.last_name,
        }

        await commonServices.dynamicUpdate(req, tables.users, updateData, { 'email': body.email });
        return resp.cResponse(req, res, resp.CREATED, con.account.CREATED);
    }),

    // login: asyncHandler(async (req, res) => {
    //     const body = req.body;
    //     let loginResults = await commonServices.readSingleData(req, tables.users, '*', { 'email': body.email, status: "Active" });
    //     if (loginResults.length == 0) {
    //         return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.NO_ACCOUNT);
    //     }

    //     if (!body.password) {
    //         return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.PASSWORD_BLANK);
    //     }

    //     const oldPassword = await helper.decryptData(loginResults[0].password);
    //     console.log(oldPassword)

    //     if (body.password !== oldPassword) {
    //         return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.INCORRECT_PASSWORD);
    //     }

    //     const tempData = {
    //         userId: loginResults[0].id,
    //         firstName: loginResults[0].firstName,
    //         lastName: loginResults[0].lastName,
    //         email: loginResults[0].email,
    //         phoneNumber: loginResults[0].mobileNumber,
    //         roleName: loginResults[0].role,
    //     }

    //     let regularToken = await helper.createToken(tempData, jwtConfig.jwtExpirySeconds, "login");
    //     let refreshToken = await helper.createToken(tempData, jwtConfig.refreshTokenExpiry, "login");

    //     return resp.cResponse(req, res, resp.SUCCESS, con.account.LOGIN_SUCCESSFULL, {
    //         token: regularToken,
    //         refreshToken: refreshToken
    //     })
    // }),

    sendotp: asyncHandler(async (req, res) => {

        const body = req.body;

        let loginResults = await commonServices.readSingleData(req, tables.users, '*', { 'email': body.email });

        if ((loginResults.length > 0) && (loginResults[0].status === "Active")) {

            let NewOtp = await helper.generateOtp();

            let insertData = {
                otp: NewOtp,
                status: "Inactive",
            };

            let LoginInfo = {
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

            const mail = await helper.sendMail(LoginInfo);

            let Result = await commonServices.dynamicUpdate(req, tables.users, insertData, { 'email': body.email });

            return resp.cResponse(req, res, resp.SUCCESS, con.account.OTP_SENT);
        }

        let NewOtp = await helper.generateOtp()

        let insertData = {
            uid: uuid.v1(),
            email: body.email,
            otp: NewOtp,
            status: "Inactive",
        }

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

        const mail = await helper.sendMail(info);

        let Result = await commonServices.dynamicInsert(req, tables.users, insertData);

        return resp.cResponse(req, res, resp.SUCCESS, con.account.OTP_SENT);

    }),

    verifyOtp: asyncHandler(async (req, res) => {
        
        const body = req.body;

        let Result = await commonServices.readSingleData(req, tables.users, '*', { 'email': body.email, 'otp': body.otp, });

        if (Result.length == 0) {
            return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.INVALID_OTP);
        }

    
        const loginResults = await commonServices.readSingleData(req, tables.users, '*', { 'email': body.email, 'otp': body.otp, });

        let updateData = {
            status: "Active",
            otp: null,
        };

        const updateResults = await commonServices.dynamicUpdate(req, tables.users, updateData, { 'email': body.email, 'otp': body.otp, });
        

        const tempData = {
            userId: loginResults[0].id,
            firstName: loginResults[0].firstName,
            lastName: loginResults[0].lastName,
            email: loginResults[0].email,
            phoneNumber: loginResults[0].mobileNumber,
            roleName: loginResults[0].role,
        };

        let regularToken = await helper.createToken(tempData, jwtConfig.jwtExpirySeconds, "login");
        let refreshToken = await helper.createToken(tempData, jwtConfig.refreshTokenExpiry, "login");


        let checkingDeviceToken = await commonServices.readAllData(req, tables.ud, "*", {
          "user_id": loginResults[0].id,
          "users_device_token": body.device_token
        })
        if (checkingDeviceToken.length == 0) {
          if (body.device_token) {
            await commonServices.dynamicInsert(req, tables.ud, {
              user_id: loginResults[0].id,
              users_device_token: body.device_token || null
            })
          }
        }


        return resp.cResponse(req, res, resp.SUCCESS, con.account.OTP_VERIFIED, {
            token: regularToken,
            refreshToken: refreshToken
        });

    }),

    logout: async (req, res) => {
      try {
    
        tempData = {
          userId: "",
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          roleName: "",
        }
        let devices = await commonServices.readAllData(req, tables.ud, "*", {
          users_device_token: req.body.users_device_token
        })
        let deviceId = devices.map(ele => ele.id)
        if (deviceId.length != 0) {
          await commonServices.dynamicDeleteMultiple(req, tables.ud, { id: deviceId })
        }
        let token = await helper.createToken(tempData, -120, "login");
        return resp.cResponse(req, res, resp.SUCCESS, con.account.LOGOUT, {
          token: token,
          refreshToken: token
        });
      } catch (error) {
        return resp.cResponse(req, res, resp.EXPECTATION_FAILED, error);
      }
    },

    refreshToken: async (req, res) => {
      try {
        const oldRefreshToken = req.token;
        //creating Tokens
        const tempData = {
          userId: oldRefreshToken.userId,
          firstName: oldRefreshToken.firstName,
          lastName: oldRefreshToken.lastName,
          email: oldRefreshToken.email,
          phoneNumber: oldRefreshToken.phoneNumber,
          roleName: oldRefreshToken.roleName,
        }
        let token = await helper.createToken(tempData, jwtConfig.jwtExpirySeconds, "login");
        let refreshToken = await helper.createToken(tempData, jwtConfig.refreshTokenExpiry, "login");
        return resp.cResponse(req, res, resp.SUCCESS, con.account.TOKEN_UPDATE_SUCCESS, {
          token: token,
          refreshToken: refreshToken
        });
      } catch (error) {
        return resp.cResponse(req, res, resp.EXPECTATION_FAILED, error);
      }
    },



}

module.exports = account;
