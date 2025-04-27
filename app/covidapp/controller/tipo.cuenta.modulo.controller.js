'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const tipoCuentaModuloModel = require('../sequelize').TipoCuentaModulo;

var listTipoCuentaModulo = awaitErrorHandlerFactory(async (req, res, next) => {
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var where = {};
    var tipoCuentaId = req.query.tipoCuentaId;
    if(tipoCuentaId){
        where.tipoCuentaId = tipoCuentaId;
    }

    var moduloId = req.query.moduloId;
    if(moduloId){
        where.moduloId = moduloId;
    }
    
    var result = await tipoCuentaModuloModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listTipoCuentaModulo = listTipoCuentaModulo;


