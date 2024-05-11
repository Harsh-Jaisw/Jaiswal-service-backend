const resp = require('../helpers/response');
const common = require('../helpers/common');
const eventLogger = require('../logger/eventLogger');

module.exports = async (req, res, next) => {
  //validating request parameters
  eventLogger.info([
    '\n',
    req.method,
    req.url,
    JSON.stringify(req.body)
  ].join(' '));
  req.body = common.trimBody(req.body);
  next();
}