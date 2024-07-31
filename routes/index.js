const express = require("express");
const router = express.Router();
const account = require("./account");
const common = require("./common");
const category = require("./category");


account(router);
common(router);
category(router);

module.exports = router;

