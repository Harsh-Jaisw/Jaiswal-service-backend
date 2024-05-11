
const fs = require('fs')
const path = require('path');
const randomNumber = require('random-number')

const filesys = require('fs').promises;
const customError = require('../handler/errorHandler');
const eventLogger = require('../logger/eventLogger');
const { constants } = require("fs/promises");
const logger = require('../logger/index');

const common = {
    trimBody: (body) => {
        for (var all in body) {
            if (typeof body[all] !== 'number' && typeof body[all] !== 'object' && typeof body[all] !== 'boolean') {
                body[all] = body[all].trim();
            }
        }
        return body;
    },
    encryptData: async (data) => {
        try {
            const ciphertext = await cryptoJs.AES.encrypt(data, 'my_secret_key').toString();
            return encodeURIComponent(ciphertext);
        } catch (error) {
            throw new customError('Unable to encrypt token', error.message);
        }
    },
    decryptData: async (data) => {
        try {
            let EncodedData = await decodeURIComponent(data);
            const bytes = await cryptoJs.AES.decrypt(EncodedData, 'my_secret_key');
            const originalData = await bytes.toString(cryptoJs.enc.Utf8);
            return originalData;
        } catch (error) {
            throw new customError('Unable to decrypt token', error.message);
        }
    },

    createToken: async (userData, tokenTime, tokenUse = "login") => {
        let tempData = {
            userId: userData.userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            roleName: userData.roleName,
            roleId: userData.roleId,
            isVerified: userData.is_verified == '0' ? false : true,
            userStatus: userData.userStatus,
            is_first_time: userData.is_first_time,
            iat: (new Date().getTime() / 1000)
        };
        // let date = new Date()/1000;
        // let date = new Date(Date.now() - 1000 * (60 * 3))/1000 
        // tempData.iat = date;
        let token = jwt.sign(tempData, jwtConfig.jwtKey, {
            algorithm: jwtConfig.algorithm,
            expiresIn: tokenTime,
        })
        // token = await common.encryptData(token);
        return token;
    },


    generateOtp: async () => {
        const options = {
            min: 100000, max: 999999, integer: true,
        }
        return randomNumber(options)
    },
    generateRandomPassword: async () => {
        const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '0123456789';
        const specialCharacters = '!@%^&*_';

        // Choose one lowercase letter randomly
        const randomLowercaseLetter = lowercaseLetters.charAt(Math.floor(Math.random() * lowercaseLetters.length));
        // Choose one uppercase letter randomly
        const randomUppercaseLetter = uppercaseLetters.charAt(Math.floor(Math.random() * uppercaseLetters.length));
        // Choose one digit randomly
        const randomDigit = digits.charAt(Math.floor(Math.random() * digits.length));
        // Choose one special character randomly
        const randomSpecialCharacter = specialCharacters.charAt(Math.floor(Math.random() * specialCharacters.length));
        // Generate additional random characters to complete the password
        const remainingCharacters = lowercaseLetters + uppercaseLetters + digits + specialCharacters;
        const passwordLength = 12; // You can adjust the length as needed
        let randomPassword = randomLowercaseLetter + randomUppercaseLetter + randomDigit + randomSpecialCharacter;
        for (let i = 0; i < passwordLength; i++) {
            const randomChar = remainingCharacters.charAt(Math.floor(Math.random() * remainingCharacters.length));
            randomPassword += randomChar;
        }
        // Shuffle the characters to make the password more random
        randomPassword = randomPassword.split('').sort(() => 0.5 - Math.random()).join('');

        return randomPassword.replace(/\s/g, '');
    },
    loggerMessage: (req, functionName, sql, data) => {
        let userId = "";
        let api = req.url;
        if (req.token) {
            userId = req.token.userId;
        }
        eventLogger.info(`\n API:${api}, USERID:${userId}, FUNCTION:${functionName}, PARAMETERS:(${JSON.stringify(data)}), QUERY:${sql}`);
    },
};

module.exports = common;

