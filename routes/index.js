const express = require("express");
const router = express.Router();
const account = require("./account");

account(router);

module.exports = router;

