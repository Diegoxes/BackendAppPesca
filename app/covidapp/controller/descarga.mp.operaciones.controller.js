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

const md5 = require('md5');
const moment = require('moment');

const base64Img = require('base64-img');
const uniqid = require('uniqid');
const sharp = require('sharp');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const poolDBHana = require('../../../db/connectionDBHana');

const descargaMpModel = require('../sequelize').DescargaMp;
const descargaMpImagenModel = require('../sequelize').DescargaMpImagen;
const descargaMpVideoModel = require('../sequelize').DescargaMpVideo;
const descargaMpDocumentoModel = require('../sequelize').DescargaMpDocumento;
const turnoInformeModel = require('../sequelize').TurnoInforme;

const informeFlotaModel = require('../../hanna/model/informe.flota.model');

const seguridadController = require("./seguridad.controller");

const redisCovidapp = require("../../../db/connectionRedisCovidapp");

const hannaWSArmadores = require("../../../lib/hanna_ws/hanna.ws.armadores");

const haydukMailer = require('../../../lib/hayduk_mailer/hayduk_mailer');

const DocumentAnalysisClient = require("@azure/ai-form-recognizer").DocumentAnalysisClient;
const AzureKeyCredential = require("@azure/ai-form-recognizer").AzureKeyCredential;
const ocrTicketTolvaPescaModel = require('../../balanza/sequelize').OcrTicketTolvaPesca;
const informeFlotaOdata=require('../sap_odata/ZCDSFI_308_INF_FLOTA')

var listDescargaMp = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
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
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    var result = await descargaMpModel.findOne({
        where: {
            id: req.params.id,
            estado: 1
        },
        include: [
            { model: descargaMpImagenModel, as: 'imagenes', where:{ estado: 1 }, required: false },
            { model: descargaMpVideoModel, as: 'videos', where:{ estado: 1 }, required: false },
            { model: descargaMpDocumentoModel, as: 'documentos', where:{ estado: 1 }, required: false }
        ]
    });

    if(result != null){
        for (var i = 0; i < result.imagenes.length; i++) {
            if(!result.imagenes[i].dataValues.archivoUploadToAzure){
                result.imagenes[i].dataValues.thumbnailBase64 = base64Img.base64Sync(result.imagenes[i].dataValues.thumbnailFullPath);
            }
        }
    }
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getDescargaMp = getDescargaMp;

var addDescargaMp = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    var {
        informeFlota,
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
        tolvaId,
        tolvaNombre,
        fechaDescarga,
        armadorTelefono,
        armadorEmail,
        imagenes,
        videoUploaded,
        documentoUploaded
    } = req.body;

    var descargaMPObj = await descargaMpModel.findOne({
        where:{
            informeFlota:informeFlota.trim(),
            estado:1
        }
    });

    if(descargaMPObj != null){
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_DUPLICADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_DUPLICADO(`El informe de flota "${informeFlota}" ya tiene una descarga de materia prima activa`), null));
        return;
    }

    var data = {
        id: descargaMpModel.sequelize.literal(`NEWID()`),
        informeFlota:informeFlota.trim(),
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
        tolvaId,
        tolvaNombre,
        fechaDescarga: descargaMpModel.sequelize.literal(`'` + fechaDescarga + `'`),
        armadorTelefono,
        armadorEmail,
        estadoProceso: 'INI',
        streamActive:0
    };

    var resultAdd = await descargaMpModel.create(data);
    var addId = resultAdd.null;

    //*************************************************************** */
    //INI:Grabamos las imagenes
    //*************************************************************** */
    var dataImagesUpload = [];
    for (var i = 0; i < imagenes.length; i++) {
        //save image
        var base64header = (imagenes[i].data.split(","))[0];
        var fileName = uniqid(addId + "-");
        var filePath = await base64Img.imgSync(imagenes[i].data, config.app.module.descargaMp.imagePath, fileName);
        var nameFilePath = filePath.split(sep);

        //generate thumbnail
        var fileThumbnails = 'thumbnails-' + nameFilePath[nameFilePath.length - 1];
        sharp(filePath).resize(120).toFile(config.app.module.descargaMp.imagePath + sep + fileThumbnails, (err, resizeImage) => {
            if (err) {
                logger.error(err);
            } else {
                logger.info(resizeImage);
            }
        });

        dataImagesUpload.push({
            id: descargaMpImagenModel.sequelize.literal(`NEWID()`),
            descargaMpId: addId,
            azureContainerName: "",
            azureDirectoryPath: "",
            azureBlobName: "",
            etiqueta: imagenes[i].etiqueta,
            thumbnail: fileThumbnails,
            thumbnailPath: config.app.module.descargaMp.imagePath,
            thumbnailFullPath: config.app.module.descargaMp.imagePath + sep + fileThumbnails,
            base64header: base64header,
            estadoProceso: "INI",
            archivoHDD: nameFilePath[nameFilePath.length - 1],
            pathArchivoHDD: config.app.module.descargaMp.imagePath,
            fullPathArchivoHDD: filePath,
            archivoUploadToAzure: 0
        });
    }
    await descargaMpImagenModel.bulkCreate(dataImagesUpload);

    //*************************************************************** */
    //INI:Grabamos el video en BD
    //*************************************************************** */
    if (videoUploaded != null) {
        //Insertamos el video
        var dataVideoUpload = {
            id: descargaMpVideoModel.sequelize.literal(`NEWID()`),
            descargaMpId: addId,
            azureContainerName: videoUploaded.azureContainerName,
            azureDirectoryPath: videoUploaded.azureDirectoryPath,
            azureBlobName: videoUploaded.azureBlobName,
            etiqueta: videoUploaded.etiqueta,
            thumbnail: '',
            thumbnailPath: '',
            thumbnailFullPath: '',
            base64header: videoUploaded.mimetype !== ''? 'data:' + videoUploaded.mimetype + ';base64':'',
            estadoProceso: "INI",
            archivoHDD: videoUploaded.fileName,
            pathArchivoHDD: videoUploaded.directoryPath,
            fullPathArchivoHDD: videoUploaded.filePath,
            archivoUploadToAzure: videoUploaded.archivoUploadToAzure
        };

        await descargaMpVideoModel.create(dataVideoUpload);
    }

    //*************************************************************** */
    //INI:Grabamos el documento en BD
    //*************************************************************** */
    if (documentoUploaded != null) {
        //Insertamos el documento
        var dataDocumentoUpload = {
            id: descargaMpDocumentoModel.sequelize.literal(`NEWID()`),
            descargaMpId: addId,
            azureContainerName: documentoUploaded.azureContainerName,
            azureDirectoryPath: documentoUploaded.azureDirectoryPath,
            azureBlobName: documentoUploaded.azureBlobName,
            labelBlobName: documentoUploaded.labelBlobName,
            etiqueta: documentoUploaded.etiqueta,
        };

        await descargaMpDocumentoModel.create(dataDocumentoUpload);
    }

    //*************************************************************** */
    //INI:Generamos los URLS del Stream
    //*************************************************************** */
    var expirationDate = moment().add(4, 'h');
    var hashUrl = config.app.module.descargaMp.nms.channelPrefix + addId + "-" + expirationDate.unix() + "-" + config.app.module.descargaMp.nms.key;
    var hashChannel = md5(hashUrl);

    var urlStream = config.app.module.descargaMp.nms.urlRMTP + config.app.module.descargaMp.nms.channelPrefix + addId + "?sign=" + expirationDate.unix() +"-" + hashChannel;
    if(config.app.module.descargaMp.nms.portRMTP.trim() != '')
        urlStream = config.app.module.descargaMp.nms.urlRMTP + ":" + config.app.module.descargaMp.nms.portRMTP + config.app.module.descargaMp.nms.channelPrefix + addId + "?sign=" + expirationDate.unix() +"-" + hashChannel;

    var urlView = config.app.module.descargaMp.nms.urlWS + config.app.module.descargaMp.nms.channelPrefix + addId + "?sign=" + expirationDate.unix() +"-" + hashChannel;
    if(config.app.module.descargaMp.nms.portWS.trim() != '')
        urlView = config.app.module.descargaMp.nms.urlWS + ":" + config.app.module.descargaMp.nms.portWS + config.app.module.descargaMp.nms.channelPrefix + addId + "?sign=" + expirationDate.unix() +"-" + hashChannel;

    var dataUpdate = {
        streamUrlPush: urlStream,
        streamUrlView: urlView,
        streamMaxDate: descargaMpModel.sequelize.literal("'" + expirationDate.format("YYYY-MM-DD HH:mm:ss") + "'")
    }
    await descargaMpModel.update(dataUpdate,{where:{id:addId}});



    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, addId));
    return;
});
exports.addDescargaMp = addDescargaMp;

var editDescargaMp = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var {
        chataId,
        chataNombre,
        tolvaId,
        tolvaNombre,
        estadoProceso,
        imagenes,
        videoUploaded,
        documentoUploaded } = req.body;

    var data = {
        estadoProceso
    };

    if (chataId && chataId != null && chataId != '') {
        data.chataId = chataId;
    }

    if (chataNombre && chataNombre != null && chataNombre != '') {
        data.chataNombre = chataNombre;
    }

    if (tolvaId && tolvaId != null && tolvaId != '') {
        data.tolvaId = tolvaId;
    }

    if (tolvaNombre && tolvaNombre != null && tolvaNombre != '') {
        data.tolvaNombre = tolvaNombre;
    }

    var result = await descargaMpModel.findOne({
        where: {
            id: req.params.id
        }
    });

    if (result) {
        var resultUpdate = await result.update(data);
        var addId = req.params.id;

        //*************************************************************** */
        //INI:Grabamos las imagenes
        //*************************************************************** */

        var dataImagesUpload = [];
        for (var i = 0; i < imagenes.length; i++) {
            //save image
            var base64header = (imagenes[i].data.split(","))[0];
            var fileName = uniqid(addId + "-");
            var filePath = await base64Img.imgSync(imagenes[i].data, config.app.module.descargaMp.imagePath, fileName);
            var nameFilePath = filePath.split(sep);

            //generate thumbnail
            var fileThumbnails = 'thumbnails-' + nameFilePath[nameFilePath.length - 1];
            sharp(filePath).resize(120).toFile(config.app.module.descargaMp.imagePath + sep + fileThumbnails, (err, resizeImage) => {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info(resizeImage);
                }
            });

            dataImagesUpload.push({
                id: descargaMpImagenModel.sequelize.literal(`NEWID()`),
                descargaMpId: addId,
                azureContainerName: "",
                azureDirectoryPath: "",
                azureBlobName: "",
                etiqueta: imagenes[i].etiqueta,
                thumbnail: fileThumbnails,
                thumbnailPath: config.app.module.descargaMp.imagePath,
                thumbnailFullPath: config.app.module.descargaMp.imagePath + sep + fileThumbnails,
                base64header: base64header,
                estadoProceso: "INI",
                archivoHDD: nameFilePath[nameFilePath.length - 1],
                pathArchivoHDD: config.app.module.descargaMp.imagePath,
                fullPathArchivoHDD: filePath,
                archivoUploadToAzure: 0
            });
        }
        await descargaMpImagenModel.bulkCreate(dataImagesUpload);

        //*************************************************************** */
        //INI:Grabamos el video en BD
        //*************************************************************** */
        if (videoUploaded != null) {
            //Insertamos el video
            var dataVideoUpload = {
                id: descargaMpVideoModel.sequelize.literal(`NEWID()`),
                descargaMpId: addId,
                azureContainerName: videoUploaded.azureContainerName,
                azureDirectoryPath: videoUploaded.azureDirectoryPath,
                azureBlobName: videoUploaded.azureBlobName,
                etiqueta: videoUploaded.etiqueta,
                thumbnail: '',
                thumbnailPath: '',
                thumbnailFullPath: '',
                base64header: videoUploaded.mimetype !== ''? 'data:' + videoUploaded.mimetype + ';base64':'',
                estadoProceso: "INI",
                archivoHDD: videoUploaded.fileName,
                pathArchivoHDD: videoUploaded.directoryPath,
                fullPathArchivoHDD: videoUploaded.filePath,
                archivoUploadToAzure: videoUploaded.archivoUploadToAzure
            };

            await descargaMpVideoModel.create(dataVideoUpload);
        }

        //*************************************************************** */
        //INI:Grabamos el documento en BD
        //*************************************************************** */
        if (documentoUploaded != null) {
            //Insertamos el documento
            var dataDocumentoUpload = {
                id: descargaMpDocumentoModel.sequelize.literal(`NEWID()`),
                descargaMpId: addId,
                azureContainerName: documentoUploaded.azureContainerName,
                azureDirectoryPath: documentoUploaded.azureDirectoryPath,
                azureBlobName: documentoUploaded.azureBlobName,
                labelBlobName: documentoUploaded.labelBlobName,
                etiqueta: documentoUploaded.etiqueta,
            };

            await descargaMpDocumentoModel.create(dataDocumentoUpload);
        }

        //Si se registraros imagenes se inicia o trata de iniciar el turno de la embarcación
        if(dataImagesUpload.length > 0 || videoUploaded != null || documentoUploaded != null){
          await notificarSiguienteTurno(result);
        }

        //*****************************************************************************
        //INI:PROCESAMOS LAS IMAGENES con TAG 4.Ticket de Tolva con el OCR para obtener peso de balanzas
        //******************************************************************************/
        procesarImagenesOCRTicketBalanza(result, dataImagesUpload, 0, 0);

        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, req.params.id));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
    return;
});
exports.editDescargaMp = editDescargaMp;

var deleteDescargaMp = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp-delete'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    var { id } = req.params;
    var result = await descargaMpModel.findOne({
        where: {
            id: id
        }
    });

    if (result) {
        await descargaMpImagenModel.update({estado:0},{where:{descargaMpId:id}});
        await descargaMpVideoModel.update({estado:0},{where:{descargaMpId:id}});
        await result.update({estado:0});
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
    return;
});
exports.deleteDescargaMp = deleteDescargaMp;

var deleteVideoDescargaMp = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp-delete'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    var { id } = req.params;
    var result = await descargaMpVideoModel.findOne({
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
exports.deleteVideoDescargaMp = deleteVideoDescargaMp;

var deleteImagenDescargaMp = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp-delete'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    var { id } = req.params;
    var result = await descargaMpImagenModel.findOne({
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
exports.deleteImagenDescargaMp = deleteImagenDescargaMp;

var getInformeFlota = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var informeFlota = req.query.if.trim();
    var matricula = req.query.m;

    if (informeFlota != null && informeFlota != '') {
        var descargaMPObj = await descargaMpModel.findOne({
            where:{
                informeFlota:informeFlota,
                estado:1
            }
        });

        if(descargaMPObj != null){
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_DUPLICADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_DUPLICADO(`El informe de flota "${informeFlota}" ya tiene una descarga activa`), null));
            return;
        }

        // var resultQuery = await poolDBHana.executeQuery(informeFlotaModel.queryGetPorInformeFlota, [informeFlota]);
        var resultOdata= await informeFlotaOdata.getPorInformedeFlota({informeFlota})
        var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);

        if (formatResults.length == 0) {
            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
            return;
        }

        var resultArray = [];
        for (var i = 0; i < formatResults.length; i++) {
            var data = {
                informeFlota: formatResults[i].numinf,
                plantaId: formatResults[i].werdes,
                plantaNombre: formatResults[i].name1,
                armador: {
                    id: formatResults[i].armador,
                    nombre: formatResults[i].full_name,
                    ruc: formatResults[i].taxnum,
                    email: formatResults[i].smtp_addr,
                    telefono: formatResults[i].tel_number,
                    celular: formatResults[i].telnr_long
                },
                embarcacion: {
                    id: formatResults[i].matr_sap,
                    nombre: formatResults[i].embarc,
                    matricula: formatResults[i].matricula,
                    codMatricula: formatResults[i].cod_matr
                }
            };

            resultArray.push(data);
        }

        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultArray[0]));
    } else if (matricula != null && matricula != '') {
        // var resultQuery = await poolDBHana.executeQuery(informeFlotaModel.queryGetPorMatricula, [matricula]);
        var resultOdata= await informeFlotaOdata.getInformePorMatricula({matricula})
        var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);

        if (formatResults.length == 0) {
            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
            return;
        }

        var resultArray = [];
        for (var i = 0; i < formatResults.length; i++) {
            var data = {
                informeFlota: formatResults[i].numinf,
                plantaId: formatResults[i].werdes,
                plantaNombre: formatResults[i].name1,
                armador: {
                    id: formatResults[i].armador,
                    nombre: formatResults[i].full_name,
                    ruc: formatResults[i].taxnum,
                    email: formatResults[i].smtp_addr,
                    telefono: formatResults[i].tel_number,
                    celular: formatResults[i].telnr_long
                },
                embarcacion: {
                    id: formatResults[i].matr_sap,
                    nombre: formatResults[i].embarc,
                    matricula: formatResults[i].matricula
                }
            };

            resultArray.push(data);
        }

        //Validamos que el informe de flota no se encuentre registrado
        var descargaMPObj = await descargaMpModel.findOne({
            where:{
                informeFlota:resultArray[0].informeFlota,
                estado:1
            }
        });

        if(descargaMPObj != null){
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_DUPLICADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_DUPLICADO(`El informe de flota "${resultArray[0].informeFlota}" ya tiene una descarga activa`), null));
            return;
        }

        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultArray[0]));
    } else {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
    }
});
exports.getInformeFlota = getInformeFlota;

var getDescargaMpImagen = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
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

var uploadVideo1 = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    req.setTimeout(0); // sin timeout
    var archivo = req.files.archivo;
    var result = await procesarUploadVideo(archivo);
    if(result !== null){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_NO_PROCESADO, "No se pudo cargar el archivo. Disculpe las molestias.", null));
        return;
    }
});
exports.uploadVideo1 = uploadVideo1;

var uploadVideo2 = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    req.setTimeout(0); // sin timeout
    var archivo = req.files.archivo;
    var result = await procesarUploadVideo(archivo);
    if(result !== null){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_NO_PROCESADO, "No se pudo cargar el archivo. Disculpe las molestias.", null));
        return;
    }
});
exports.uploadVideo2 = uploadVideo2;

var uploadVideo3 = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    req.setTimeout(0); // sin timeout
    var archivo = req.files.archivo;
    var result = await procesarUploadVideo(archivo);
    if(result !== null){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_NO_PROCESADO, "No se pudo cargar el archivo. Disculpe las molestias.", null));
        return;
    }
});
exports.uploadVideo3 = uploadVideo3;

var procesarUploadVideo = (archivo) =>{
    return new Promise(async function(resolve,reject){
        try{
            var directoryPath = config.app.module.descargaMp.videosPath+sep+util.getFolderDateNow();
            var fileName = uniqid("",`-${archivo.name}`);

            await utilFile.saveFileDataToPath(archivo.data, fileName, directoryPath);

            resolve({
                archivoUploadToAzure:false,
                azureContainerName: '',
                azureDirectoryPath: '',
                azureBlobName: '',
                labelBlobName: '',
                filePath: directoryPath + sep + fileName,
                directoryPath: directoryPath,
                fileName: fileName,
                mimetype: archivo.mimetype
            });
        }catch(err){
            console.log(err);
            logger.error(err);
            reject(err);
        }
    });
};

var getVideo = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var keyRedis = "covidapp-dmp-video";
    keyRedis = keyRedis + "-" + req.params.id;

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

var renewStreamLinks = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var addId = req.params.id;
    var result = await descargaMpModel.findOne({
        where: {
            id: req.params.id
        }
    });

    if (result) {
        //Generamos los URLS de STREAM
        var expirationDate = moment().add(4, 'h');
        var hashUrl = config.app.module.descargaMp.nms.channelPrefix + addId + "-" + expirationDate.unix() + "-" + config.app.module.descargaMp.nms.key;
        var hashChannel = md5(hashUrl);

        var urlStream = config.app.module.descargaMp.nms.urlRMTP + config.app.module.descargaMp.nms.channelPrefix + addId + "?sign=" + expirationDate.unix() +"-" + hashChannel;
        if(config.app.module.descargaMp.nms.portRMTP.trim() != '')
            urlStream = config.app.module.descargaMp.nms.urlRMTP + ":" + config.app.module.descargaMp.nms.portRMTP + config.app.module.descargaMp.nms.channelPrefix + addId + "?sign=" + expirationDate.unix() +"-" + hashChannel;

        var urlView = config.app.module.descargaMp.nms.urlWS + config.app.module.descargaMp.nms.channelPrefix + addId + "?sign=" + expirationDate.unix() +"-" + hashChannel;
        if(config.app.module.descargaMp.nms.portWS.trim() != '')
            urlView = config.app.module.descargaMp.nms.urlWS + ":" + config.app.module.descargaMp.nms.portWS + config.app.module.descargaMp.nms.channelPrefix + addId + "?sign=" + expirationDate.unix() +"-" + hashChannel;

        var dataUpdate = {
            streamUrlPush: urlStream,
            streamUrlView: urlView,
            streamMaxDate: descargaMpModel.sequelize.literal("'" + expirationDate.format("YYYY-MM-DD HH:mm:ss") + "'")
        }
        var resultUpdate = await result.update(dataUpdate);

        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataUpdate));
    } else {
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
    }

});
exports.renewStreamLinks = renewStreamLinks;

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

var uploadDocumento = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-operaciones-descargamp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var archivo = req.files.archivo;
    var directory = config.azureStorage.descargaMpDirectory + "/" + config.azureStorage.documentosDirectory + "/";
    var azureBlobName = uniqid('',`-${archivo.name}`);
    var labelBlobName = archivo.name;
    var uploadBlobResponse = await utilAzureStorage.uploadFileToAzure(archivo, directory+azureBlobName);

    if(typeof uploadBlobResponse.errorCode === 'undefined'){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {
            archivoUploadToAzure:true,
            azureContainerName: config.azureStorage.containerName,
            azureDirectoryPath: directory,
            azureBlobName: azureBlobName,
            labelBlobName: labelBlobName
        }));
    }
});
exports.uploadDocumento = uploadDocumento;

var notificarSiguienteTurno = (descargaMp) => {
  console.log("INI - notificarSiguienteTurno");
  var arrEmailTo = [];
  return new Promise(async function(resolve, reject) {
    try{
      var objTurnoInforme = await turnoInformeModel.findOne({
          where:{
              informeFlota:descargaMp.informeFlota.trim(),
              turnoNotificado:1
          }
      });

      if(objTurnoInforme == null){
        var matricula = descargaMp.embarcacionMatricula;
        if(matricula.indexOf('-') >= 0){
            matricula = matricula.split("-")[1];
        }
        var nroTolva = Number.parseInt(descargaMp.tolvaId.split("-")[1]);
        console.log(matricula);
        console.log(nroTolva);

        var resultWebServiceSAP = await hannaWSArmadores.actualizarTurnoSAP(matricula, nroTolva);
        logger.info(JSON.stringify(resultWebServiceSAP));
        if (resultWebServiceSAP.RETURN == '' || resultWebServiceSAP.RETURN == '0') {
          var dataTurnoInforme = {
            informeFlota:descargaMp.informeFlota,
            turnoNotificado:true
          };

          await turnoInformeModel.create(dataTurnoInforme);
          resolve(true);
          return;
        }
      }

      resolve(false);
    }catch(err){
      console.log(err);
      logger.error(err);

      resolve(false);
      return;
    }
  });
};

var procesarImagenesOCRTicketBalanza = async (objDescargaMp, arrImagenes, cont, intento) => {
  if(arrImagenes.length <= 0){
    console.log("INFO - procesarImagenesOCRTicketBalanza - no hay imagenes que procesar - cont= " + cont);
    return;
  }

  var imagen = arrImagenes[cont];
  if(typeof imagen === 'undefined'){
    console.log("INFO - procesarImagenesOCRTicketBalanza - imagen undefined - cont=" + cont);
    return;
  }
  var filePath = imagen.fullPathArchivoHDD;
  const file = fs.createReadStream(filePath);

  console.log("INI - procesarImagenesOCRTicketBalanza IF " + objDescargaMp.informeFlota + " - " + cont + " - " + filePath + " - " + intento);
  if(imagen.etiqueta === '4. Ticket de Tolva'){
    try{
      var client = new DocumentAnalysisClient(config.azureFormRecognizer.ticketBalanzaOCR.endpoint, new AzureKeyCredential(config.azureFormRecognizer.ticketBalanzaOCR.key1));
      const poller = await client.beginAnalyzeDocuments(config.azureFormRecognizer.ticketBalanzaOCR.modelId, file);
      const { pages, tables, styles, keyValuePairs, entities, documents } = await poller.pollUntilDone();

      console.log(Object.entries(documents[0].fields));

      var plantasTecnipesa = {
        'H101':'0002',
        'H102':'0003',
        'H105':'0006',
      };

      var nroTolva = documents[0].fields.nro_tolva.value; //Si es undefined tomar el nro de tolva de la descarga
      var reporteRecepcion = documents[0].fields.reporte_recepcion.value;
      var reporteRecepcion2 = documents[0].fields.reporte_recepcion2.value;
      var matricula = documents[0].fields.matricula.value;
      var matricula2 = documents[0].fields.matricula2.value;
      var especie = documents[0].fields.especie.value;
      var fechaInicio = documents[0].fields.fecha_inicio.value;
      var horaInicio = documents[0].fields.hora_inicio.value;
      var totalRecibido = documents[0].fields.total_recibido.value;
      var batchRecibidos = documents[0].fields.batch_recibidos.value;
      var batchRecibidos2 = documents[0].fields.batch_recibidos2.value;
      var fechaFin = documents[0].fields.fecha_fin.value;
      var horaFin = documents[0].fields.hora_fin.value;

      var arrBatchs = documents[0].fields.tbBatchs.values;

      //Verificamos los 3 campos básicos
      var booContinuar = true;
      if(typeof matricula === 'undefined'){
        if(typeof matricula2 === 'undefined'){
          booContinuar = false;
        }else if(matricula2.length > 15){
          booContinuar = false;
        }else{
          matricula = matricula2;
        }

      }else if(matricula.length > 15){
          if(typeof matricula2 === 'undefined'){
            booContinuar = false;
          }else if(matricula2.length > 15){
            booContinuar = false;
          }else{
            matricula = matricula2;
          }
      }

      if(typeof totalRecibido === 'undefined'){
        if(arrBatchs.length > 0){
          var objLastRowProp = arrBatchs[arrBatchs.length-1].properties;
          var booUltimaFila = false;

          if(objLastRowProp['NRO'].value == batchRecibidos || objLastRowProp['NRO'].value == batchRecibidos2){
            var totalRecibidoTabla = objLastRowProp['ACUMULADO'].value;

            if(totalRecibidoTabla.indexOf(' ') == -1){
              try{
                totalRecibido = Number.parseInt(totalRecibidoTabla);
              }catch(err){
                booContinuar = false;
              }
            }else{
              booContinuar = false;
            }
          }else{
            booContinuar = false;
          }
        }else{
          booContinuar = false;
        }
      }

      var regFecha = /[0-9][0-9]\/[0-9][0-9]\/[0-9][0-9][0-9][0-9]/;
      if(typeof fechaInicio === 'undefined'){
        booContinuar = false;
      }else{
        var fechaIndex = fechaInicio.search(regFecha);
        if(fechaIndex >= 0){
            fechaInicio = fechaInicio.substring(fechaIndex,fechaIndex+10);
        }else{
            booContinuar = false;
        }
      } 

      if(typeof fechaFin === 'undefined'){
        booContinuar = false;
      }else{
        var fechaIndex = fechaFin.search(regFecha);
        if(fechaIndex >= 0){
            fechaFin = fechaFin.substring(fechaIndex,fechaIndex+10);
        }else{
            booContinuar = false;
        }
      } 

      var regHora = /[0-9][0-9]:[0-9][0-9]/;
      if(typeof horaInicio === 'undefined'){
        booContinuar = false;
      }else{
          var horaIndex = horaInicio.search(regHora);
          if(horaIndex >= 0){
            horaInicio = horaInicio.substring(horaIndex,horaIndex+5);
          }else{
            booContinuar = false;
          }

      } 

      if(typeof horaFin === 'undefined'){
        booContinuar = false;
      }else{
          var horaIndex = horaFin.search(regHora);
          if(horaIndex >= 0){
            horaFin = horaFin.substring(horaIndex,horaIndex+5);
          }else{
            booContinuar = false;
          }

      } 

      //Verificamos si continuamos con el registro
      if(booContinuar){
        //Limpieza de otros campos y transformacion de campos
        if(typeof nroTolva === 'undefined'){
          nroTolva = Number.parseInt(objDescargaMp.tolvaNombre.replace('Tolva ',''));
        }else if(nroTolva > 5){
          nroTolva = Number.parseInt(objDescargaMp.tolvaNombre.replace('Tolva ',''));
        }

        if(typeof reporteRecepcion === 'undefined'){
          if(typeof reporteRecepcion2 === 'undefined'){
            reporteRecepcion = null;
          }else{
            reporteRecepcion = reporteRecepcion2;
          }
        }

        if(typeof especie === 'undefined') especie = 'ANCHOVETA'; //por defecto es anchoveta
        if(typeof batchRecibidos === 'undefined'){
          if(typeof batchRecibidos2 === 'undefined'){
            batchRecibidos = null;
          }else{
            batchRecibidos = batchRecibidos2;
          }
        }

        var nroReporteBD = null;
        if(reporteRecepcion != null){
          if(reporteRecepcion.indexOf('-') >= 0){
            var reporteRecepcionSplit = reporteRecepcion.split('-');
            nroReporteBD = reporteRecepcionSplit[0];
          }else{
            nroReporteBD = reporteRecepcion;
          }
        }

        var fechaInicioSplit = fechaInicio.split('/');
        var fechaInicioBD = `${fechaInicioSplit[2]}-${fechaInicioSplit[1]}-${fechaInicioSplit[0]} ${horaInicio}`;

        var fechaFinSplit = fechaFin.split('/');
        var fechaFinBD = `${fechaFinSplit[2]}-${fechaFinSplit[1]}-${fechaFinSplit[0]} ${horaFin}`;

        var plantaBD = plantasTecnipesa[objDescargaMp.plantaId];
        var informeFlotaBD = objDescargaMp.informeFlota;

        var especieBD = 1;
        if(especie.indexOf("ANCHOVETA") >= 0){
          especieBD = 1;
        }

        var dataInsertar = {
          plantaId:plantaBD,
          fechaHoraInicio:ocrTicketTolvaPescaModel.sequelize.literal("'" + fechaInicioBD + "'"),
          fechaHoraFin:ocrTicketTolvaPescaModel.sequelize.literal("'" + fechaFinBD + "'"),
          fechaHoraFin:ocrTicketTolvaPescaModel.sequelize.literal("'" + fechaFinBD + "'"),
          nroMatricula:matricula,
          especie:especieBD,
          nroPesadas:batchRecibidos,
          pesoAcumulado:totalRecibido,
          nroTolva:nroTolva,
          nroReporte:nroReporteBD,
          informeFlota:informeFlotaBD,
          pathImagen:filePath
        };

        try{
          await ocrTicketTolvaPescaModel.create(dataInsertar);
          var msj = "Se inserto la data OCR de la imagen - " + JSON.stringify(dataInsertar);
          console.log(msj);
          logger.info(msj);
        }catch(errSequelize){
          await notificarIntentoOCREmail(objDescargaMp, imagen, file);

          console.log("errSequelize");
          console.log(errSequelize);
          logger.error(errSequelize);
        }

      }else{
        await notificarIntentoOCREmail(objDescargaMp, imagen, file);

        var msj = "No se detecto información confiable en la imagen " + filePath;
        console.log(msj);
        logger.info(msj);
      }
    }catch(err){
      console.log(err);

      intento++;
      if(intento < 2){
        setTimeout(function(){
          procesarImagenesOCRTicketBalanza(objDescargaMp, arrImagenes, cont, intento);
        },1000);
      }else{
        await notificarIntentoOCREmail(objDescargaMp, imagen, file);
      }
    }
  }

  console.log("FIN - procesarImagenesOCRTicketBalanza IF " + objDescargaMp.informeFlota + " - " + cont + " - " + filePath + " - " + intento);
  cont++;
  if(cont < arrImagenes.length){
    procesarImagenesOCRTicketBalanza(objDescargaMp, arrImagenes, cont,0);
  }

};

var notificarIntentoOCREmail = async (objDescargaMp, imagen, file) => {
    // Envio de la notificacion
    try{
        var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
        var type = 'html';
        var to = config.email.toErrorOCRTicketBalanza;
        var asunto = "Imagen OCR no procesada - IF "+ objDescargaMp.informeFlota;
        var mensajeHTML = "Hola no se pudo procesar con OCR la imagen con: <br><br>etiqueta ="+ imagen.etiqueta + "<br> nombre =" + imagen.archivoHDD;

        var fileNameSplit = imagen.archivoHDD.split("\\");
        var fileName = fileNameSplit[fileNameSplit.length-1];
        var imageBuffer = await utilFile.getFileFromPath(file.path);

        var attachments = [
            {
                filename: fileName,
                value: imageBuffer
            }
        ];
        var resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
        var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, null, resultAttachments);
        
        console.log("Enviado email" + " - " + resultSendMail.messageId);
        logger.info("Enviado email" + " - " + resultSendMail.messageId);

    }catch(errMail){
        console.log("Error email", errMail);
        logger.error(JSON.stringify(errMail));
    }

}
