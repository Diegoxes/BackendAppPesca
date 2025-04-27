'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const plantaModel = require('../sequelize').Planta;
const chataModel =  require('../sequelize').Chata;
const tolvaModel =  require('../sequelize').Tolva;

var listPlanta = awaitErrorHandlerFactory(async (req, res, next) => {
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var where = {
        estado:true
    };
    
    var result = await plantaModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag,
        include:[
            { model: chataModel, as: 'chatas', include:[
                { model: tolvaModel, as: 'tolvas'}
            ]}
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listPlanta = listPlanta;

var obtenerPlanta = awaitErrorHandlerFactory(async (req, res, next) => {
    var result = await plantaModel.findOne({
        where: {
            id: req.params.id
        },
        include:[
            { model: chataModel, as: 'chatas', include:[
                { model: tolvaModel, as: 'tolvas'}
            ]}
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.obtenerPlanta = obtenerPlanta;