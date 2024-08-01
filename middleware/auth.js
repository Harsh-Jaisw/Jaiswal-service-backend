const jwt = require('jsonwebtoken')
const config = require('config').get('jwtConfig')
const resp = require('../helpers/response')
const common = require('../helpers/common')
const eventLogger = require('../logger/eventLogger')
const con = require('../constants/index')
const cs = require('../services/common')

module.exports = async function (req, res, next) {
    // check if there is no token
    if (!req.headers.authorization) {
        return resp.cResponse(
            req,
            res,
            resp.UNAUTHORIZED,
            con.middleware.NO_TOKEN
        )
    }
    try {
        //verify token
        let token = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, config.jwtKey)
        req.token = decodedToken
        eventLogger.info(
            [
                '\n',
                req.method,
                req.url,
                req.token.userId,
                JSON.stringify(req.body),
            ].join(' ')
        )

        //Validate user
        userInfo = await cs.readSingleData(req, 'users', 'id', {
            email: decodedToken.email,
            status: 'Active',
        })

        if (userInfo.length == 0) {
            return resp.cResponse(
                req,
                res,
                resp.UNAUTHORIZED,
                con.middleware.AUTHORIZATION_DENIED
            )
        }
        //validating request parameters
        req.body = common.trimBody(req.body)

        next()
    } catch (err) {
        console.log(err)
        return resp.cResponse(
            req,
            res,
            resp.EXPECTATION_FAILED,
            con.middleware.INVALID_TOKEN
        )
    }
}
