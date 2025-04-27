'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const logAccesoModel = require('../sequelize').LogAcceso;
const moduloModel = require('../sequelize').Modulo;

var listLogAccesos = awaitErrorHandlerFactory(async (req, res, next) => {
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var where = {};
    var search = req.query.search;

    
    if (search) {
        where[Op.or] = [
            { username: { [Op.like]: '%' + search + '%' } },
            { moduloId: { [Op.like]: '%' + search + '%' } },
            { detalle: { [Op.like]: '%' + search + '%' } }
        ];
    }

    var fechaInicio = req.query.fechaInicio;
    var fechaFin = req.query.fechaFin;
    if(fechaInicio && fechaFin){
        where.fecha = {
            [Op.gte]: pangaBamar0DiaModel.sequelize.literal("'" + fechaInicio + " 00:00:00'"),
            [Op.lte]: pangaBamar0DiaModel.sequelize.literal("'" + fechaFin + " 23:59:59'")
        };
    }else if(fechaInicio){
        where.fecha = {
            [Op.gte]: pangaBamar0DiaModel.sequelize.literal("'" + fechaInicio + " 00:00:00'")
        };
    }else if(fechaFin){
        where.fecha = {
            [Op.lte]: pangaBamar0DiaModel.sequelize.literal("'" + fechaFin + " 23:59:59'")
        };
    }
    
    var result = await logAccesoModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag,
        include: [
            { model: moduloModel, as: 'modulo' }
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listLogAccesos = listLogAccesos;
