'use strict';

const logger = require('./basic-logger');
const constants = require('../config/constants');
const util = require('./util');

//middleware to hanlde errors 
var awaitErrorHandlerFactory = middleware => {
  return async (req, res, next) => {
    try {
      await middleware(req, res, next);
    } catch (err) {
      logger.error(err);
      util.consoleLog(err);
      res.status(constants.CODIGO.SERVIDOR.ERROR);
      res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, constants.MENSAJE.SERVIDOR.ERROR, null));
    }
  };
};

module.exports = awaitErrorHandlerFactory;