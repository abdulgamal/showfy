const fieldErrors = require('../functions/error')
const errorCodes = require("../functions/statusCodes")
const constant = require("../functions/constant")

module.exports = (req, res, next) => {
    if (!req.user) {
        return res.send({ error: fieldErrors.errors([{ msg: constant.general.LOGIN }], true), status: errorCodes.unauthorized }).end();
    }
    next();
}