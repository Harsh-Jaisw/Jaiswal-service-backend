const makeDb = require('../config/db');
const config = require('config').get('database');
const dbError = require('../handler/errorHandler');
const eventLogger = require('../logger/eventLogger');
const commonHelper = require('../helpers/common');
const commonServices = require('./common');

const notificationServices = {
  getUsersNotificationsToken: async (userId) => {
    const db = makeDb(config);
    try {
      let valueArray = [];
      let sql = `SELECT users_device_token FROM user_devices WHERE user_id = ?`;
      valueArray.push(userId);
      return await db.query(sql, valueArray);
    } catch (error) {
      console.error('Error getting users:', error);
      throw new dbError('Database error', error);
    } finally {
      db.close();
    }
  },
};

module.exports = notificationServices;
