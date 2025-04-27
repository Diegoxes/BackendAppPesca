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

const descargaMpModel = require('../sequelize').DescargaMp;
const descargaMpImagenModel = require('../sequelize').DescargaMpImagen;
const descargaMpVideoModel = require('../sequelize').DescargaMpVideo;
const descargaMpDocumentoModel = require('../sequelize').DescargaMpDocumento;

const seguridadController = require("./seguridad.controller");

const redisCovidapp = require("../../../db/connectionRedisCovidapp")

var listDescargaMp = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-mipesca-descargamp'];
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
        where.fechaDescarga = {
            [Op.gte]: descargaMpModel.sequelize.literal("'" + fecha + " 00:00:00'"),
            [Op.lte]: descargaMpModel.sequelize.literal("'" + fecha + " 23:59:59'")
        }
    }

    var estado = req.query.estado;
    if (estado && estado != null && estado != '') {
        where.estadoProceso = estado;
    }

    var informeFlota = req.query.informeFlota;
    if (informeFlota && informeFlota != null && informeFlota != '') {
        where.informeFlota = informeFlota;
    }

    where.armadorRuc = resultToken.rucEmpresa;
    where.estado = 1;
    
    var result = await descargaMpModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag,
        order: [
            ['fechaDescarga', 'DESC']
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));    
});
exports.listDescargaMp = listDescargaMp;

var getDescargaMp = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-mipesca-descargamp'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var attributes = [
        'id'
        ,'informeFlota'
        ,'armadorId'
        ,'armadorRuc'
        ,'armadorNombre'
        ,'embarcacionId'
        ,'embarcacionMatricula'
        ,'embarcacionNombre'
        ,'plantaId'
        ,'plantaNombre'
        ,'chataId'
        ,'chataNombre'
        ,'fechaDescarga'
        ,'armadorTelefono'
        ,'armadorEmail'
        ,'estadoProceso'
        ,'tolvaId'
        ,'tolvaNombre'
        ,'streamUrlView'
        ,'streamActive'
    ];

    var result = await descargaMpModel.findOne({
        attributes:attributes,
        where: {
            id: req.params.id,
            armadorRuc: resultToken.rucEmpresa,
            estado:1
        },
        include: [
            { model: descargaMpImagenModel, as: 'imagenes', where:{ estado: 1 }, required: false },
            { model: descargaMpVideoModel, as: 'videos', where:{ estado: 1 }, required: false },
            { model: descargaMpDocumentoModel, as: 'documentos', where:{ estado: 1 }, required: false }
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
exports.getDescargaMp = getDescargaMp;

var getDescargaMpImagen = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-mipesca-descargamp'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var keyRedis = "covidapp-dmp-img";
    keyRedis = keyRedis + "-" + req.params.id;

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    var result = await descargaMpImagenModel.findOne({
        where: {
            id: req.params.id
        }
    });

    await redisCovidapp.setKey(keyRedis, result, 10800);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getDescargaMpImagen = getDescargaMpImagen;

var getVideo = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-mipesca-descargamp'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var keyRedis = "covidapp-dmp-video";
    keyRedis = keyRedis+"-"+req.params.id;

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    var result = await descargaMpVideoModel.findOne({
        where: {
            id: req.params.id
        }
    });
    await redisCovidapp.setKey(keyRedis, result, 10800);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getVideo = getVideo;

var downloadImagen = awaitErrorHandlerFactory(async (req, res, next) => {
    var result = await descargaMpImagenModel.findOne({
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

var downloadVideo = awaitErrorHandlerFactory(async (req, res, next) => {
    req.setTimeout(0); // sin timeout

    var keyRedis = "covidapp-dmp-video";
    keyRedis = keyRedis + "-" + req.params.id;
    
    var resultVideo = await redisCovidapp.getKey(keyRedis)
    if (resultVideo == null) {
        resultVideo = await descargaMpVideoModel.findOne({
            where: {
                id: req.params.id
            }
        });
        await redisCovidapp.setKey(keyRedis, resultVideo, 10800);
    }

    if(resultVideo != null){
        var contentType = resultVideo.base64header.replace("data:","").replace(";base64","");
        var filepath = resultVideo.fullPathArchivoHDD;
        if(resultVideo.archivoUploadToAzure){
            filepath = config.app.module.descargaMp.temporalMediaPath+sep+resultVideo.azureBlobName;
            if (!fs.existsSync(filepath)) {
                var fileInStorage = resultVideo.azureDirectoryPath+resultVideo.azureBlobName;
                var blob = await utilAzureStorage.getBlobFromAzure(fileInStorage);
                await utilFile.saveFileDataToPath(blob, resultVideo.azureBlobName, config.app.module.descargaMp.temporalMediaPath);
            }
        }

        setTimeout(function(){
            util.streamVideo(req, res,filepath, contentType);
        },1000);
    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
        return;
    }
});
exports.downloadVideo = downloadVideo;