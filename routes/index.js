const express = require("express");
const router = express.Router();
const account = require("./account");
const common = require("./common");



account(router);
common(router);

module.exports = router;

