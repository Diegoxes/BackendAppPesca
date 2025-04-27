'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const moment = require('moment');
const zonaPescaZonasModel = require('../sequelize').ZonaPescaZonas;
const poolDBHana = require('../../../db/connectionDBHana');
const seguridadController = require("./seguridad.controller");

const redisCovidapp = require("../../../db/connectionRedisCovidapp");

const zonaPescaCalasModel = require('../../hanna/model/zona.pesca.calas.model');
const zonaPescaReferenciaModel = require('../sequelize').ZonaPescaReferencia;
const zonaPescaZonasReferenciaModel = require('../sequelize').ZonaPescaZonasReferencia;
const oDataZonasPesca=require('../sap_odata/ZCDSPP_405_CDS_ZONAS_PESCA')

var listZonas = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-mipesca-zonaPesca'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var fecha = req.query.fecha;
    var keyRedis = `covidapp-zonaPescaZonasModel-listZonas-${fecha}`;
    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    var result = await zonaPescaZonasModel.findAll({
        attributes: [
            'id',
            [Sequelize.literal(`FORMAT (fecha, 'dd/MM/yyyy')`),'fecha'],
            'nombre',
            'lat',
            'latGMS',
            'lng',
            'lngGMS',
            'descripcion'
        ],
        include:[
            {
                model:zonaPescaZonasReferenciaModel,
                as:'zonaPescaZonasReferencia',
                include:[
                    {
                        model:zonaPescaReferenciaModel,
                        as:'zonaPescaReferencia'
                    }
                ]
            }
        ],
        where:{
            fecha: Sequelize.literal(`fecha = '${fecha}'`),
            estado:true
        },
        order:[
            ['fecha', 'DESC']
        ]
    });

    if(result.length > 0){
        await redisCovidapp.setKey(keyRedis, result, 21600); //Almacenamos por 6 horas
    }
    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listZonas = listZonas;

var listCalas = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-mipesca-zonaPesca'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var fecha = req.query.fecha;

    var keyRedis = `covidapp-zonaPescaCalasModel-listCalas-${fecha}`;
    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    var fechaHana = moment(fecha,'YYYY-MM-DD').format('YYYYMMDD');
    // var resultQuery = await poolDBHana.executeQuery(zonaPescaCalasModel.queryGetCalas, [fechaHana]);
    var resultOdataZonasPesca=await oDataZonasPesca.getCalas({fechaHana})
    var formatResult=resultOdataZonasPesca.d.results.map(({ __metadata, ...rest }) => rest);

    if(formatResult.length > 0){
        await redisCovidapp.setKey(keyRedis, formatResult, 3600); //Almacenamos por 1 hora
    }
    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, formatResult));

});
exports.listCalas = listCalas;

var listReferencias = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-mipesca-zonaPesca'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var keyRedis = `covidapp-zonaPescaZonasModel-listReferencias`;
    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    var result = await zonaPescaReferenciaModel.findAll();

    if(result.length > 0){
        await redisCovidapp.setKey(keyRedis, result, 21600); //Almacenamos por 6 horas
    }
    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listReferencias = listReferencias;
