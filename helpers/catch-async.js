const fs = require('fs');
const resp = require('../helpers/response');

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => (resp.cResponse(req, res, resp.EXPECTATION_FAILED, error))).finally(() => {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          return true;
        }
      }
    });
  };
};
