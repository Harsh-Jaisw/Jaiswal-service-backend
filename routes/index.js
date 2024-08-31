const express = require('express');
const router = express.Router();
const account = require('./account');
const common = require('./common');
const category = require('./category');
const faq = require('./faq');
const subcategory = require('./subcategory');
const faqSubcategory = require('./faqSubcategory');

account(router);
common(router);
category(router);
faq(router);
subcategory(router);
faqSubcategory(router);

module.exports = router;
