const statusCode = require('./statusCodes');
const logger = require('../logger/eventLogger');
const commonHelper = require('./common');
const eventLogger = require('../logger/eventLogger');

module.exports = class Helper extends statusCode {
    static async cResponse(req, res, status, info, data = null) { // Add 'async' here
        // Generating custom error messages for logger
        let customMsg;
        if (info.stack) {
            if (info.errorMessage) {
                customMsg = info.errorMessage;
                info = info.name;
            } else {
                customMsg = info.stack;
                info = info.message;
            }
            logger.info(JSON.stringify(customMsg));
        }

        let userId = req.token ? req.token.userId : "";
        let responseObj = {
            status: status,
            message: info
        }
        if (data != null) {
            Object.assign(responseObj, { data: data })
        }
        let finalResponse;
        if (process.env.NODE_ENV == 'development') {
            const encryptedResponse = await commonHelper.encryptData(JSON.stringify(responseObj));
            finalResponse = {
                response: encryptedResponse
            }
        } else {//mount router
            finalResponse = responseObj;
        }
        eventLogger.info(`\n${req.method} ${req.url} ${userId} {${status} ${info}}\n`)
        if (info == 'Database error') {
            if (customMsg.errno == 1452) {
                const regex = /FOREIGN KEY \(([^)]+)\) REFERENCES/;
                const match = regex.exec(customMsg.sqlMessage);
                let foreignKeyString = " "
                if (match) {
                    foreignKeyString = match[1];
                }
                responseObj.message = `${foreignKeyString} details not exist`;
            } else if (customMsg.errno == 1062) {
                responseObj.message = customMsg.sqlMessage
            }
            else {
                responseObj.message = info
            }
        }
        res.status(status).json(responseObj);
    }
};