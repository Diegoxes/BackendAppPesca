'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const utilFile = require('../../../util/util-file');
const utilAzureStorage = require('../../../util/util-azure-storage');
const constants = require('../../../config/constants');
const config = require('../../../config/config');
const fs = require('fs');
const path = require('path');
const sep = path.sep;

const base64Img = require('base64-img');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const residuosSolidosModel = require('../sequelize').ResiduosSolidos;
const residuosSolidosImagenModel = require('../sequelize').ResiduosSolidosImagen;

const seguridadController = require("./seguridad.controller");

const redisCovidapp = require("../../../db/connectionRedisCovidapp")


var listResiduosSolidos = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-mipesca-residuossolidos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var where = {};
    
    var embarcacion = req.query.embarcacion;
    if (embarcacion && embarcacion != null && embarcacion != '') {
        where = {
            [Op.or]: [
                { embarcacionMatricula: { [Op.like]: '%' + embarcacion + '%' } },
                { embarcacionNombre: { [Op.like]: '%' + embarcacion + '%' } }
            ]
        };
    }

    var fecha = req.query.fecha;
    if (fecha && fecha != null && fecha != '') {
        where.fecha = {
            [Op.gte]: residuosSolidosModel.sequelize.literal("'" + fecha + " 00:00:00'"),
            [Op.lte]: residuosSolidosModel.sequelize.literal("'" + fecha + " 23:59:59'")
        }
    }

    where.armadorRuc = resultToken.rucEmpresa
    where.estado = 1;
    var result = await residuosSolidosModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag,
        order: [
            ['fecha', 'DESC']
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
    
});
exports.listResiduosSolidos = listResiduosSolidos;

var getResiduosSolidos = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-mipesca-residuossolidos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var result = await residuosSolidosModel.findOne({
        where: {
            id: req.params.id,
            armadorRuc: resultToken.rucEmpresa,
            estado:1
        },
        include: [
            { model: residuosSolidosImagenModel, as: 'imagenes', where:{ estado: 1 }, required: false }
        ]
    });

    if(result != null){
        for(var i=0; i<result.imagenes.length; i++){
            if(!result.imagenes[i].dataValues.archivoUploadToAzure){
                result.imagenes[i].dataValues.thumbnailBase64 = base64Img.base64Sync(result.imagenes[i].dataValues.thumbnailFullPath);
            }
        }
    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getResiduosSolidos = getResiduosSolidos;

var getResiduosSolidosImagen = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-mipesca-residuossolidos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var keyRedis = "covidapp-rs-img";
    keyRedis = keyRedis+"-"+req.params.id;

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    var result = await residuosSolidosImagenModel.findOne({
        where: {
            id: req.params.id
        }
    });

    await redisCovidapp.setKey(keyRedis, result, 10800);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
    
});
exports.getResiduosSolidosImagen = getResiduosSolidosImagen;

var downloadImagen = awaitErrorHandlerFactory(async (req, res, next) => {
    var result = await residuosSolidosImagenModel.findOne({
        where: {
            id: req.params.id
        }
    });

    if(result != null){
        //Descargamos el archivo
        var filePath = result.fullPathArchivoHDD;
        var fileName = result.archivoHDD;

        res.download(filePath, fileName);
    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.download('','');
    }
});
exports.downloadImagen = downloadImagen;