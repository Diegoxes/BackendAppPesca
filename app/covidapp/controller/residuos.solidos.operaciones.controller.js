'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const utilFile = require('../../../util/util-file');
const utilAzureStorage = require('../../../util/util-azure-storage');
const constants = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');
const path = require('path');
const sep = path.sep;

const base64Img = require('base64-img');
const uniqid = require('uniqid');
const sharp = require('sharp');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const residuosSolidosModel = require('../sequelize').ResiduosSolidos;
const residuosSolidosImagenModel = require('../sequelize').ResiduosSolidosImagen;

const seguridadController = require("./seguridad.controller");

const redisCovidapp = require("../../../db/connectionRedisCovidapp")

var listResiduosSolidos = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-residuossolidos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

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

    var armador = req.query.armador;
    if (armador && armador != null && armador != '') {
        where.armadorId = armador;
    }

    var fecha = req.query.fecha;
    if (fecha && fecha != null && fecha != '') {
        where.fecha = {
            [Op.gte]: residuosSolidosModel.sequelize.literal("'" + fecha + " 00:00:00'"),
            [Op.lte]: residuosSolidosModel.sequelize.literal("'" + fecha + " 23:59:59'")
        }
    }

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
    var arrModulosIds= ['covidapp-operaciones-residuossolidos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var result = await residuosSolidosModel.findOne({
        where: {
            id: req.params.id,
            estado:1
        },
        include: [
            { model: residuosSolidosImagenModel, as: 'imagenes', where:{ estado: 1 }, required: false }
        ]
    });

    if(result != null)
        for(var i=0; i<result.imagenes.length; i++){
            if(!result.imagenes[i].dataValues.archivoUploadToAzure){
                result.imagenes[i].dataValues.thumbnailBase64 = base64Img.base64Sync(result.imagenes[i].dataValues.thumbnailFullPath);
            }
        }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getResiduosSolidos = getResiduosSolidos;

var addResiduosSolidos = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-residuossolidos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var { armadorId,
        armadorRuc,
        armadorNombre,
        embarcacionId,
        embarcacionMatricula,
        embarcacionNombre,
        plantaId,
        plantaNombre,
        chataId,
        chataNombre,
        fecha,
        imagenes
    } = req.body;
    
    var data = {
        id:residuosSolidosModel.sequelize.literal(`NEWID()`),
        armadorId,
        armadorRuc,
        armadorNombre,
        embarcacionId,
        embarcacionMatricula,
        embarcacionNombre,
        plantaId,
        plantaNombre,
        chataId,
        chataNombre,
        fecha: residuosSolidosModel.sequelize.literal(`'`+fecha+`'`),
        estadoProceso:'FIN'
    };

    var resultAdd = await residuosSolidosModel.create(data);
    var addId = resultAdd.null;

    var dataImagesUpload = [];
    for(var i=0; i<imagenes.length; i++){
        //save image
        var base64header = (imagenes[i].data.split(","))[0];
        var fileName = uniqid(addId+"-");
        var filePath = await base64Img.imgSync(imagenes[i].data, config.app.module.residuosSolidos.imagePath, fileName);
        var nameFilePath = filePath.split(sep);
        
        //generate thumbnail
        var fileThumbnails = 'thumbnails-'+nameFilePath[nameFilePath.length-1];
        sharp(filePath).resize(120).toFile(config.app.module.residuosSolidos.imagePath + sep + fileThumbnails, (err, resizeImage) => {
            if (err) {
                logger.error(err);
            } else {
                logger.info(resizeImage);
            }
        });

        dataImagesUpload.push({
            id:residuosSolidosImagenModel.sequelize.literal(`NEWID()`),
            residuosSolidosId:addId,
            azureContainerName: "",
            azureDirectoryPath: "",
            azureBlobName: "",
            etiqueta:imagenes[i].etiqueta,
            thumbnail:fileThumbnails,
            thumbnailPath:config.app.module.residuosSolidos.imagePath,
            thumbnailFullPath:config.app.module.residuosSolidos.imagePath+sep+fileThumbnails,
            base64header:base64header,
            estadoProceso:"FIN",
            archivoHDD: nameFilePath[nameFilePath.length - 1],
            pathArchivoHDD: config.app.module.residuosSolidos.imagePath,
            fullPathArchivoHDD: filePath,
            archivoUploadToAzure: 0
        });
    }

    //Insertamos las imagenes
   await residuosSolidosImagenModel.bulkCreate(dataImagesUpload);

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {id:addId}));
    return;
});
exports.addResiduosSolidos = addResiduosSolidos;

var editResiduosSolidos = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-residuossolidos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var { estadoProceso } = req.body;

    var data = {
        estadoProceso
    };

    var result = await residuosSolidosModel.findOne({
        where: {
            id: req.params.id
        }
    });

    if (result) {
        var resultUpdate = await result.update(data);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.editResiduosSolidos = editResiduosSolidos;

var deleteResiduosSolidos = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-residuossolidos-delete'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var { id } = req.params;
    var result = await residuosSolidosModel.findOne({
        where: {
            id: id
        }
    });

    if (result) {
        await residuosSolidosImagenModel.update({estado:0},{where:{residuosSolidosId:id}});
        await result.update({estado:0});
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.deleteResiduosSolidos = deleteResiduosSolidos;

var deleteImagenResiduosSolidos = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-residuossolidos-delete'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var { id } = req.params;
    var result = await residuosSolidosImagenModel.findOne({
        where: {
            id: id
        }
    });

    if (result) {
        await result.update({estado:0});
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.deleteImagenResiduosSolidos = deleteImagenResiduosSolidos;


var getResiduosSolidosImagen = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-residuossolidos'];
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