const fs = require('fs');
const path = require('path');
const randomNumber = require('random-number');
const cryptoJs = require('crypto-js');
const filesys = require('fs').promises;
const customError = require('../handler/errorHandler');
const eventLogger = require('../logger/eventLogger');
const { constants } = require('fs/promises');
const logger = require('../logger/index');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { default: axios } = require('axios');
const config = './config/default.json';
const jwtConfig = require('config').get('jwtConfig');

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

  createToken: async (userData, tokenTime, tokenUse = 'login') => {
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
      iat: new Date().getTime() / 1000,
    };
    let token = jwt.sign(tempData, jwtConfig.jwtKey, {
      algorithm: jwtConfig.algorithm,
      expiresIn: tokenTime,
    });
    // token = await common.encryptData(token);
    return token;
  },

  generateOtp: async () => {
    const options = {
      min: 100000,
      max: 999999,
      integer: true,
    };
    return randomNumber(options);
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
    randomPassword = randomPassword
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');

    return randomPassword.replace(/\s/g, '');
  },
  loggerMessage: (req, functionName, sql, data) => {
    let userId = '';
    let api = req.url;
    if (req.token) {
      userId = req.token.userId;
    }
    eventLogger.info(
      `\n API:${api}, USERID:${userId}, FUNCTION:${functionName}, PARAMETERS:(${JSON.stringify(data)}), QUERY:${sql}`,
    );
  },
  sendMail: async (info) => {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'harikrushnamultimedia@gmail.com',
        pass: 'mvdzyawjmysmtbtc',
      },
    });

    transporter.sendMail(info, (err) => {
      if (err) {
        return err;
      } else {
        return info;
      }
    });
  },
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  },

  getAddressFromCoordinates: async (latitude, longitude) => {
    console.log(`Fetching address for coordinates: ${latitude}, ${longitude}`);

    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBREu0TuBV343q5TCsPaFQuEYVZbNRqM8E`, {
        params: {
          lat: latitude,
          lon: longitude,
        }
      });
      console.log(response.data.results[0])
      // Ensure that response.data has the fields you expect
      if (response.data && response.data.results && response.data.results[0]) {
        const addressComponents = response.data.results[0].address_components;

        const address = {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        };

        addressComponents.forEach(component => {
          if (component.types.includes('street_number')) {
            address.line1 = component.long_name;
          }
          if (component.types.includes('route')) {
            address.line2 = component.long_name;
          }
          if (component.types.includes('locality')) {
            address.city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            address.state = component.short_name; // or use long_name if you prefer full state names
          }
          if (component.types.includes('postal_code')) {
            address.postalCode = component.long_name;
          }
          if (component.types.includes('country')) {
            address.country = component.long_name;
          }
        });
        console.log(address)
        return address;
      } else {
        console.warn('Unexpected response format:', response.data);
        return {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        };
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error.message);
      return {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      };
    }
  }
};

module.exports = common;
