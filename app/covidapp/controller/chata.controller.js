'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const chataModel = require('../sequelize').Chata;

var listChata = awaitErrorHandlerFactory(async (req, res, next) => {
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var where = {};
    
    var result = await chataModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listChata = listChata;


