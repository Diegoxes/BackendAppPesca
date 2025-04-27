'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const utilFile = require('../../../util/util-file');
const utilAzureStorage = require('../../../util/util-azure-storage');
const constants = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');
const fs = require('fs');
const path = require('path');
const sep = path.sep;

const base64Img = require('base64-img');
const uniqid = require('uniqid');
const sharp = require('sharp');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const despachoCombustibleModel = require('../sequelize').DespachoCombustible;
const despachoCombustibleImagenModel = require('../sequelize').DespachoCombustibleImagen;
const despachoCombustibleVideoModel = require('../sequelize').DespachoCombustibleVideo;

const seguridadController = require("./seguridad.controller");

const redisCovidapp = require("../../../db/connectionRedisCovidapp")

var listDespachoCombustible = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible'];
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
        where.fechaDespacho = {
            [Op.gte]: despachoCombustibleModel.sequelize.literal("'" + fecha + " 00:00:00'"),
            [Op.lte]: despachoCombustibleModel.sequelize.literal("'" + fecha + " 23:59:59'")
        }
    }

    var estado = req.query.estado;
    if (estado && estado != null && estado != '') {
        where.estadoProceso = estado;
    }

    where.estado = 1;
    var result = await despachoCombustibleModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag,
        order: [
            ['fechaDespacho', 'DESC']
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listDespachoCombustible = listDespachoCombustible;

var getDespachoCombustible = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var result = await despachoCombustibleModel.findOne({
        where: {
            id: req.params.id,
            estado:1
        },
        include: [
            { model: despachoCombustibleImagenModel, as: 'imagenes', where:{ estado: 1 }, required: false },
            { model: despachoCombustibleVideoModel, as: 'videos', where:{ estado: 1 }, required: false }
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
exports.getDespachoCombustible = getDespachoCombustible;

var addDespachoCombustible = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible'];
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
        fechaDespacho,
        armadorTelefono,
        armadorEmail,
        imagenes,
        videoUploaded
     } = req.body;

    var data = {
        id: despachoCombustibleModel.sequelize.literal(`NEWID()`),
        armadorId,
        armadorRuc,
        armadorNombre,
        embarcacionId,
        embarcacionMatricula,
        embarcacionNombre,
        plantaId,
        plantaNombre,
        fechaDespacho: despachoCombustibleModel.sequelize.literal(`'`+fechaDespacho+`'`),
        armadorTelefono,
        armadorEmail,
        estadoProceso:'INI'
    };

    var resultAdd = await despachoCombustibleModel.create(data);
    var addId = resultAdd.null;

    var dataImagesUpload = [];
    for(var i=0; i<imagenes.length; i++){
        //save image
        var base64header = (imagenes[i].data.split(","))[0];
        var fileName = uniqid(addId+"-");
        var filePath = await base64Img.imgSync(imagenes[i].data, config.app.module.despachoCombustible.imagePath, fileName);
        var nameFilePath = filePath.split(sep);

        //generate thumbnail
        var fileThumbnails = 'thumbnails-'+nameFilePath[nameFilePath.length-1];
        sharp(filePath).resize(120).toFile(config.app.module.despachoCombustible.imagePath + sep + fileThumbnails, (err, resizeImage) => {
            if (err) {
                logger.error(err);
            } else {
                logger.info(resizeImage);
            }
        });

        dataImagesUpload.push({
            id:despachoCombustibleImagenModel.sequelize.literal(`NEWID()`),
            despachoCombustibleId:addId,
            azureContainerName: "",
            azureDirectoryPath: "",
            azureBlobName: "",
            etiqueta:imagenes[i].etiqueta,
            thumbnail:fileThumbnails,
            thumbnailPath:config.app.module.despachoCombustible.imagePath,
            thumbnailFullPath:config.app.module.despachoCombustible.imagePath+sep+fileThumbnails,
            base64header:base64header,
            estadoProceso:"INI",
            archivoHDD: nameFilePath[nameFilePath.length - 1],
            pathArchivoHDD: config.app.module.despachoCombustible.imagePath,
            fullPathArchivoHDD: filePath,
            archivoUploadToAzure: 0
        });
    }

    //Insertamos las imagenes
    await despachoCombustibleImagenModel.bulkCreate(dataImagesUpload);

    //Cargamos el Video
    if(videoUploaded != null){
       
        //Insertamos el video
        var dataVideoUpload = {
            id:despachoCombustibleVideoModel.sequelize.literal(`NEWID()`),
            despachoCombustibleId:addId,
            azureContainerName: "",
            azureDirectoryPath: "",
            azureBlobName: "",
            etiqueta:videoUploaded.etiqueta,
            thumbnail:'',
            thumbnailPath:'',
            thumbnailFullPath:'',
            base64header:'data:'+videoUploaded.mimetype+';base64',
            estadoProceso:"INI",
            archivoHDD: videoUploaded.fileName,
            pathArchivoHDD: videoUploaded.directoryPath,
            fullPathArchivoHDD: videoUploaded.filePath,
            archivoUploadToAzure: 0
        };

        await despachoCombustibleVideoModel.create(dataVideoUpload);
    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, addId));
    return;
});
exports.addDespachoCombustible = addDespachoCombustible;

var editDespachoCombustible = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var { estadoProceso, 
        imagenes, 
        videoUploaded } = req.body;

    var data = {
        estadoProceso
    };

    var result = await despachoCombustibleModel.findOne({
        where: {
            id: req.params.id
        }
    });

    if (result) {
        var resultUpdate = await result.update(data);

        var addId = req.params.id;
        var dataImagesUpload = [];
        for(var i=0; i<imagenes.length; i++){
            //save image
            var base64header = (imagenes[i].data.split(","))[0];
            var fileName = uniqid(addId+"-");
            var filePath = await base64Img.imgSync(imagenes[i].data, config.app.module.despachoCombustible.imagePath, fileName);
            var nameFilePath = filePath.split(sep);
            
            //generate thumbnail
            var fileThumbnails = 'thumbnails-'+nameFilePath[nameFilePath.length-1];
            sharp(filePath).resize(120).toFile(config.app.module.despachoCombustible.imagePath + sep + fileThumbnails, (err, resizeImage) => {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info(resizeImage);
                }
            });
         
            dataImagesUpload.push({
                id:despachoCombustibleImagenModel.sequelize.literal(`NEWID()`),
                despachoCombustibleId:addId,
                azureContainerName: "",
                azureDirectoryPath: "",
                azureBlobName: "",
                etiqueta:imagenes[i].etiqueta,
                thumbnail:fileThumbnails,
                thumbnailPath:config.app.module.despachoCombustible.imagePath,
                thumbnailFullPath:config.app.module.despachoCombustible.imagePath+sep+fileThumbnails,
                base64header:base64header,
                estadoProceso:estadoProceso,
                archivoHDD: nameFilePath[nameFilePath.length - 1],
                pathArchivoHDD: config.app.module.despachoCombustible.imagePath,
                fullPathArchivoHDD: filePath,
                archivoUploadToAzure: 0
            });
        }

        //Insertamos las imagenes
        await despachoCombustibleImagenModel.bulkCreate(dataImagesUpload);

        //Cargamos el Video
        if(videoUploaded != null){
            
            //Insertamos el video
            var dataVideoUpload = {
                id:despachoCombustibleVideoModel.sequelize.literal(`NEWID()`),
                despachoCombustibleId:addId,
                azureContainerName: "",
                azureDirectoryPath: "",
                azureBlobName: "",
                etiqueta:videoUploaded.etiqueta,
                thumbnail:'',
                thumbnailPath:'',
                thumbnailFullPath:'',
                base64header:'data:'+videoUploaded.mimetype+';base64',
                estadoProceso:"INI",
                archivoHDD: videoUploaded.fileName,
                pathArchivoHDD: videoUploaded.directoryPath,
                fullPathArchivoHDD: videoUploaded.filePath,
                archivoUploadToAzure: 0
            };

            await despachoCombustibleVideoModel.create(dataVideoUpload);
        }

        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, req.params.id));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.editDespachoCombustible = editDespachoCombustible;

var deleteDespachoCombustible = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible-delete'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var { id } = req.params;
    var result = await despachoCombustibleModel.findOne({
        where: {
            id: id
        }
    });

    if (result) {
        await despachoCombustibleImagenModel.update({estado:0},{where:{despachoCombustibleId:id}});
        await despachoCombustibleVideoModel.update({estado:0},{where:{despachoCombustibleId:id}});
        await result.update({estado:0});
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.deleteDespachoCombustible = deleteDespachoCombustible;

var deleteVideoDespachoCombustible = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible-delete'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var { id } = req.params;
    var result = await despachoCombustibleVideoModel.findOne({
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
exports.deleteVideoDespachoCombustible = deleteVideoDespachoCombustible;

var deleteImagenDespachoCombustible = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible-delete'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var { id } = req.params;
    var result = await despachoCombustibleImagenModel.findOne({
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
exports.deleteImagenDespachoCombustible = deleteImagenDespachoCombustible;

var getDespachoCombustibleImagen = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var keyRedis = "covidapp-dc-img";
    keyRedis = keyRedis+"-"+req.params.id;

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    var result = await despachoCombustibleImagenModel.findOne({
        where: {
            id: req.params.id
        }
    });

    await redisCovidapp.setKey(keyRedis, result, 10800);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getDespachoCombustibleImagen = getDespachoCombustibleImagen;

var uploadVideo1 = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }
    
    var archivo = req.files.archivo;
    var achivoNameSplit = archivo.name.split(".");

    var fileName = uniqid(achivoNameSplit[0] + "-");
    fileName += "." + achivoNameSplit[1];

    //Grabamos el archivo en disco
    var folder = util.getFolderDateNow();
    var directoryPath = config.app.module.despachoCombustible.videosPath+sep+folder;
    await utilFile.saveFileDataToPath(archivo.data, fileName, directoryPath);

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {
        filePath: directoryPath + sep + fileName,
        directoryPath: directoryPath,
        fileName: fileName,
        mimetype: archivo.mimetype
    }));
    
});
exports.uploadVideo1 = uploadVideo1;

var uploadVideo2 = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }
    
    var archivo = req.files.archivo;
    var achivoNameSplit = archivo.name.split(".");

    var fileName = uniqid(achivoNameSplit[0] + "-");
    fileName += "." + achivoNameSplit[1];

    //Grabamos el archivo en disco
    var folder = util.getFolderDateNow();
    var directoryPath = config.app.module.despachoCombustible.videosPath+sep+folder;
    await utilFile.saveFileDataToPath(archivo.data, fileName, directoryPath);

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {
        filePath: directoryPath + sep + fileName,
        directoryPath: directoryPath,
        fileName: fileName,
        mimetype: archivo.mimetype
    }));
    
});
exports.uploadVideo2 = uploadVideo2;

var uploadVideo3 = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }
    
    var archivo = req.files.archivo;
    var achivoNameSplit = archivo.name.split(".");

    var fileName = uniqid(achivoNameSplit[0] + "-");
    fileName += "." + achivoNameSplit[1];

    //Grabamos el archivo en disco
    var folder = util.getFolderDateNow();
    var directoryPath = config.app.module.despachoCombustible.videosPath+sep+folder;
    await utilFile.saveFileDataToPath(archivo.data, fileName, directoryPath);

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {
        filePath: directoryPath + sep + fileName,
        directoryPath: directoryPath,
        fileName: fileName,
        mimetype: archivo.mimetype
    }));
    
});
exports.uploadVideo3 = uploadVideo3;

var getVideo= awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-operaciones-despachocombustible'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var keyRedis = "covidapp-dc-video";
    keyRedis = keyRedis+"-"+req.params.id;

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    var result = await despachoCombustibleVideoModel.findOne({
        where: {
            id: req.params.id
        }
    });
    await redisCovidapp.setKey(keyRedis, result, 10800);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getVideo = getVideo;

var downloadImagen = awaitErrorHandlerFactory(async (req, res, next) => {
    var result = await despachoCombustibleImagenModel.findOne({
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

    var keyRedis = "covidapp-dc-video";
    keyRedis = keyRedis + "-" + req.params.id;
    
    var resultVideo = await redisCovidapp.getKey(keyRedis)
    if (resultVideo == null) {
        resultVideo = await despachoCombustibleVideoModel.findOne({
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