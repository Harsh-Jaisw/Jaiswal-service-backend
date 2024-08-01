const express = require('express')
const router = express.Router()
const account = require('./account')
const common = require('./common')
const category = require('./category')
const faq = require('./faq')

account(router)
common(router)
category(router)
faq(router)

module.exports = router
