const resp = require('../helpers/response');


module.exports = (Joi, validationObject) => {
  return (req, res, next) => {
    const JoiSchema = Joi.object(validationObject).unknown(true).options({
      abortEarly: true,
    });
    const response = JoiSchema.validate(req.body);
    if (response.error) {
      return resp.cResponse(req, res, resp.FORBIDDEN_ERROR, response.error.details[0].message.replace(/"/g, ""));
    }
    next()
  };
};
