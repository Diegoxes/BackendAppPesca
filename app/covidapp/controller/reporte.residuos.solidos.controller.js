'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const constants = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');
const util = require('../../../util/util');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const residuosSolidosModel = require('../sequelize').ResiduosSolidos;
const residuosSolidosImagenModel = require('../sequelize').ResiduosSolidosImagen;

const seguridadController = require("./seguridad.controller");

var listResiduosSolidosActas = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-reporte-residuosSolidos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var where = {};
    where.estado = 1;

    var embarcacion = req.query.embarcacion;
    if (embarcacion && embarcacion != null && embarcacion != '') {
        where = {
            [Op.or]: [
                { embarcacionMatricula: { [Op.like]: '%' + embarcacion + '%' } },
                { embarcacionNombre: { [Op.like]: '%' + embarcacion + '%' } }
            ]
        };
    }

    var fechaInicio = req.query.fechaInicio;
    var fechaFin = req.query.fechaFin;
    where.fecha = {
        [Op.gte]: residuosSolidosModel.sequelize.literal("'" + fechaInicio + " 00:00:00'"),
        [Op.lte]: residuosSolidosModel.sequelize.literal("'" + fechaFin + " 23:59:59'")
    }

    var planta = req.query.planta;
    if(planta && planta != null && planta != ''){
        where.plantaId = planta;
    }

    var chata = req.query.chata;
    if(chata && chata != null && chata != ''){
        where.chataId = chata;
    }

    var result = await residuosSolidosModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag,
        include:[
            { model: residuosSolidosImagenModel, as: 'imagenes', where:{ estado: 1 }, required: false }
        ],
        order: [
            ['fecha', 'DESC']
        ]
    });
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
    return;
});
exports.listResiduosSolidosActas = listResiduosSolidosActas;
