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
  ud: "users_devices",
  mr: "master_roles",
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

  sendotp: asyncHandler(async (req, res) => {
    const body = req.body;

    try {
     
      const loginResults = await commonServices.readSingleData(req, tables.users, '*', { 'email': body.email });
      
      if (loginResults.length > 0 && loginResults[0].email.toLowerCase() === body.email.toLowerCase()) {

        const newOtp = await helper.generateOtp();
        const updateData = {
          otp: newOtp,
        };
        await commonServices.dynamicUpdate(req, tables.users, updateData, { 'email': body.email });
        const OTPInfo = {
          from: '"harikrushnamultimedia@gmail.com"',
          to: body.email,
          subject: `Hello, User: ${body.email}`,
          text: `Hello, Mr/Mrs: ${body.email}, Your OTP is: ${newOtp}`,
          html: `
                    <body style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px;">
                        <div style="background-color: #ffffff; max-width: 600px; margin: auto; border-radius: 10px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                            <h1 style="color: #333;">We Are Here to Assist You!</h1>
                            <p style="color: #555; font-size: 16px;">Your OTP is : ${newOtp}</p>
                        </div>
                    </body>`,
        };
        await helper.sendMail(OTPInfo);
        return resp.cResponse(req, res, resp.SUCCESS, con.account.OTP_SENT);
      }
      else if (loginResults.length > 0 && loginResults[0].status === "Active") {
        // Case: User found, but email doesn't match or status is Active
        const newOtp = await helper.generateOtp();

        // Update user's OTP and status to Inactive
        const updateData = {
          otp: newOtp,
        };
        await commonServices.dynamicUpdate(req, tables.users, updateData, { 'email': body.email });

        // Sending login info email with new OTP
        const loginInfo = {
          from: '"harikrushnamultimedia@gmail.com"',
          to: body.email,
          subject: `Hello, User: ${body.email}`,
          text: `Hello, Mr/Mrs: ${body.email}, Your new OTP is: ${newOtp}`,
          html: `
                    <body style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px;">
                        <div style="background-color: #ffffff; max-width: 600px; margin: auto; border-radius: 10px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                            <h1 style="color: #333;">We Are Here to Assist You!!!!</h1>
                            <p style="color: #555; font-size: 16px;">Dear ${newOtp},</p>
                            <p style="color: #555; font-size: 16px;">Thank you for contacting us.</p>
                        </div>
                    </body>`,
        };
        await helper.sendMail(loginInfo);

        // Respond with success message
        return resp.cResponse(req, res, resp.SUCCESS, con.account.OTP_SENT);
      } else {
        // Case: User not found, insert new user

        // Generate new OTP
        const newOtp = await helper.generateOtp();

        // Insert new user with generated OTP and Inactive status
        const insertData = {
          uid: uuid.v1(),
          email: body.email,
          otp: newOtp,
          status: "Inactive",
        };
        await commonServices.dynamicInsert(req, tables.users, insertData);

        // Sending new user info email with OTP
        const info = {
          from: '"harikrushnamultimedia@gmail.com"',
          to: body.email,
          subject: `Hello, User: ${body.email}`,
          text: `Hello, Mr/Mrs: ${body.email}, Your OTP is: ${newOtp}`,
          html: `
                    <body style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px;">
                        <div style="background-color: #ffffff; max-width: 600px; margin: auto; border-radius: 10px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                            <h1 style="color: #333;">We Are Here to Assist You!!</h1>
                            <p style="color: #555; font-size: 16px;">Dear ${newOtp},</p>
                            <p style="color: #555; font-size: 16px;">Thank you for contacting us.</p>
                        </div>
                    </body>`,
        };
        await helper.sendMail(info);

        // Respond with success message
        return resp.cResponse(req, res, resp.SUCCESS, con.account.OTP_SENT);
      }
    } catch (error) {
      console.error("Error in sendotp endpoint:", error);
      // Handle errors appropriately (e.g., respond with error status)
      return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, con.account.SOMETHING_WRONG);
    }
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
    const role = await commonServices.readSingleData(req, tables.mr, '*', { 'id': loginResults[0].role });
    console.log(role)
    const tempData = {
      userId: loginResults[0].id,
      firstName: loginResults[0].firstName,
      lastName: loginResults[0].lastName,
      email: loginResults[0].email,
      phoneNumber: loginResults[0].mobileNumber,
      roleName: role[0].name,
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
      refreshToken: refreshToken,
      role: role[0].name,
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

  resendOtp: asyncHandler(async (req, res) => {
    const body = req.body;
  })

}

module.exports = account;
