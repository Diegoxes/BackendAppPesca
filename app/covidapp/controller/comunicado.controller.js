'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const uniqid = require('uniqid');
const moment = require('moment');
const seguridadController = require('../controller/seguridad.controller');

const comunicadoModel = require('../sequelize').Comunicado;
const comunicadoViewModel = require('../sequelize').ComunicadoView;
const tipoCuentaModel = require('../sequelize').TipoCuenta;

const utilAzureStorage = require('../../../util/util-azure-storage');

var listComunicados = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-administracion-comunicados'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var where = {};
    where.estado = true;

    var search = req.query.search;
    if (search) {
        where = {
            [Op.or]: [
                { titulo: { [Op.like]: '%' + search + '%' } },
            ]
        };
    }

    var result = await comunicadoModel.findAndCountAll({
        attributes:[
            'id',
            [Sequelize.literal(`FORMAT (fechaPublicacion, 'dd/MM/yyyy HH:mm') `),'fechaPublicacion'],
            [Sequelize.literal(`FORMAT (fechaPublicacion, 'yyyy-MM-dd HH:mm') `),'fechaOrden'],
            'destinoTipoCuentaID',
            'destinoUsuarios',
            'titulo',
            'textoNotificacion',
            'mensaje',
            'tieneImagen',
            'urlImagen',
            'tieneArchivo',
            'urlArchivo',
            'tieneVideo',
            'urlVideo',
            'estadoPublicacion',
        ],
        where: where,
        offset: offSet,
        limit: regPag,
        include:[
            { model: tipoCuentaModel, as:'destinoTipoCuenta', require:false },
        ],
        order:[
            [Sequelize.literal('fechaOrden DESC')]
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listComunicados = listComunicados;

var getComunicado = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-administracion-comunicados'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var result = await comunicadoModel.findOne({
        where: {
            id: req.params.id,
            estado:true
        },
        include:[
            { model: tipoCuentaModel, as:'destinoTipoCuenta', require:false },
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getComunicado = getComunicado;

var addComunicado = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-administracion-comunicados-registrar'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var {fechaPublicacion, horaPublicacion, titulo, textoNotificacion, mensaje, destinoTipoCuentaID,
         destinoUsuarios, tieneImagen, urlImagen, tieneArchivo, urlArchivo, tieneVideo, urlVideo } = req.body;

    var data = {
        id: comunicadoModel.sequelize.literal(`NEWID()`),
        fechaPublicacion: comunicadoModel.sequelize.literal(`'${fechaPublicacion} ${horaPublicacion}:00:00'`),
        titulo,
        textoNotificacion,
        mensaje,
        destinoTipoCuentaID,
        destinoUsuarios,
        tieneImagen,
        urlImagen,
        tieneArchivo,
        urlArchivo,
        tieneVideo,
        urlVideo,
        estadoPublicacion:"NEW"
    };

    var resultAdd = await comunicadoModel.create(data);
    var addId = resultAdd.null;
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {id:addId}));
    return;
        
});
exports.addComunicado = addComunicado;

var editComunicado = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-administracion-comunicados-editar'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var {fechaPublicacion, horaPublicacion, titulo, textoNotificacion, mensaje, destinoTipoCuentaID,
        destinoUsuarios, tieneImagen, urlImagen, tieneArchivo, urlArchivo, tieneVideo, urlVideo } = req.body;

    var objComunicado = await comunicadoModel.findOne({
        where:{
            id:req.params.id,
            estado:true
        }
    });
    if (objComunicado) {
        var data = {
            fechaPublicacion: comunicadoModel.sequelize.literal(`'${fechaPublicacion} ${horaPublicacion}:00:00'`),
            titulo,
            textoNotificacion,
            mensaje,
            destinoTipoCuentaID,
            destinoUsuarios,
            tieneImagen,
            urlImagen,
            tieneArchivo,
            urlArchivo,
            tieneVideo,
            urlVideo,
        };
     
        await objComunicado.update(data);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
    return;
    

});
exports.editComunicado = editComunicado;

var deleteComunicado = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-administracion-comunicados-eliminar'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var { id } = req.params;
    var arrIds = id.split(",");

    //Obtenemos los Ids finales a eliminar
    var result = await comunicadoModel.findAll({
        where: {
            id: arrIds
        }
    });

    if (result) {
        var arrIdsFinal = [];
        for (var i = 0; i < result.length; i++) {
            arrIdsFinal.push(result[i].id);
        }

        if (arrIdsFinal.length > 0) {
            await comunicadoModel.update({estado:false},{ where : { id : arrIdsFinal }});

            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
            return;
        } else {
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
            return;
        }
        
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
    return;    
});
exports.deleteComunicado = deleteComunicado;

var uploadVideoComunicado = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-administracion-comunicados'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    req.setTimeout(0); // sin timeout
    var archivo = req.files.archivo;
    var directory = config.azureStorage.comunicadosDirectory + "/" + config.azureStorage.videosDirectory + "/";
    var azureBlobName = uniqid('',`-${archivo.name}`);
    var uploadBlobResponse = await utilAzureStorage.uploadFileToAzure(archivo, directory+azureBlobName);
    if(typeof uploadBlobResponse.errorCode === 'undefined'){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {
            archivoUploadToAzure:true,
            azureUrlPath: config.azureStorage.url+config.azureStorage.containerName+"/"+directory+azureBlobName
        }));
    }

});
exports.uploadVideoComunicado = uploadVideoComunicado;



var uploadDocumentoComunicado = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-administracion-comunicados'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    req.setTimeout(0); // sin timeout
    var archivo = req.files.archivo;
    var directory = config.azureStorage.comunicadosDirectory + "/" + config.azureStorage.documentosDirectory + "/";
    var azureBlobName = uniqid('',`-${archivo.name}`);
    var uploadBlobResponse = await utilAzureStorage.uploadFileToAzure(archivo, directory+azureBlobName);
    if(typeof uploadBlobResponse.errorCode === 'undefined'){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {
            archivoUploadToAzure:true,
            azureUrlPath: config.azureStorage.url+config.azureStorage.containerName+"/"+directory+azureBlobName
        }));
    }
});
exports.uploadDocumentoComunicado = uploadDocumentoComunicado;


var uploadImagenComunicado = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp-administracion-comunicados'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }
    req.setTimeout(0); // sin timeout
    var archivo = req.files.archivo;
    var directory = config.azureStorage.comunicadosDirectory + "/" + config.azureStorage.imagenesDirectory + "/";
    var azureBlobName = uniqid('',`-${archivo.name}`);
    var uploadBlobResponse = await utilAzureStorage.uploadFileToAzure(archivo, directory+azureBlobName);
    if(typeof uploadBlobResponse.errorCode === 'undefined'){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {
            archivoUploadToAzure:true,
            azureUrlPath: config.azureStorage.url+config.azureStorage.containerName+"/"+directory+azureBlobName
        }));
    }
});
exports.uploadImagenComunicado = uploadImagenComunicado;

var countComunicadosUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var where = {};
    where.estado = true;

    var anio = moment().format('YYYY');
    var mes = moment().format('MM');

    where.fechaPublicacion = Sequelize.literal(`fechaPublicacion BETWEEN '${anio}-${mes}-01 00:00:00' AND '${anio}-${mes}-${moment().format('DD')} ${moment().format('HH:mm:ss')}'`)
    where.destinoTipoCuentaID = Sequelize.literal(`(destinoTipoCuentaID = '${resultToken.tipoCuentaId}' OR destinoUsuarios LIKE '%${resultToken.username}%')`);
    where.comunicadoId = Sequelize.literal(`[comunicadoView].[comunicadoId] IS NULL`);

    var result = await comunicadoModel.count({
        where: where,
        include: [
            { 
                model: comunicadoViewModel, 
                as: 'comunicadoView', 
                required: false, 
                where:{
                    username: resultToken.username
                },
            }
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
    return;
});

exports.countComunicadosUsuario = countComunicadosUsuario;


var listComunicadosUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var where = {};
    where.estado = true;

    var anio = req.query.anio;
    var mes = req.query.mes;

    var fechaActual = moment();
    var fechaConsulta = moment(`${anio}-${mes}-01`,'YYYY-MM-DD');
    var diaInicio = '01';
    var diaFin = fechaConsulta.endOf('month').format('DD');
    var horaFin = '23:59:59';

    //Si la consulta es del mes actual, hacemos la consulta hasta el dia y hora actual. Si es un mes anterior se busca hasta el ultimo dia del mes
    if(fechaConsulta.format("YYYY-MM") == fechaActual.format("YYYY-MM")){
        diaFin = fechaActual.format("DD");
        horaFin = fechaActual.format('HH:mm:ss');
    }

    where.fechaPublicacion = Sequelize.literal(`fechaPublicacion BETWEEN '${anio}-${mes}-${diaInicio} 00:00:00' AND '${anio}-${mes}-${diaFin} ${horaFin}'`)
    where.destinoTipoCuentaID = Sequelize.literal(`(destinoTipoCuentaID = '${resultToken.tipoCuentaId}' OR destinoUsuarios LIKE '%${resultToken.username}%')`);
    var result = await comunicadoModel.findAndCountAll({
        attributes:[
            'id',
            [Sequelize.literal(`FORMAT (fechaPublicacion, 'dd/MM/yyyy')`),'fechaPublicacion'],
            [Sequelize.literal(`FORMAT (fechaPublicacion, 'yyyy-MM-dd HH:mm')`),'fechaOrden'],
            'titulo',
            'textoNotificacion',
            'estadoPublicacion'
        ],
        where: where,
        offset: offSet,
        limit: regPag,
        include: [
            { model: comunicadoViewModel, as: 'comunicadoView', required: false },
        ],
        order:[
            [Sequelize.literal('fechaOrden DESC')]
        ]

    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
    return;
});
exports.listComunicadosUsuario = listComunicadosUsuario;


var getComunicadosUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds = ['covidapp'];
    if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
        return;
    }

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    
    var where = {};
    where.estado = true;
    where.id = req.params.id;
    where.destinoTipoCuentaID = Sequelize.literal(`(destinoTipoCuentaID = '${resultToken.tipoCuentaId}' OR destinoUsuarios LIKE '%${resultToken.username}%')`);
 
    var result = await comunicadoModel.findOne({
        attributes:[
            'id',
            [Sequelize.literal(`FORMAT (fechaPublicacion, 'dd/MM/yyyy HH:mm')`),'fechaPublicacion'],
            'titulo',
            'textoNotificacion',
            'mensaje',
            'tieneImagen',
            'urlImagen',
            'tieneArchivo',
            'urlArchivo',
            'tieneVideo',
            'urlVideo',
            'estadoPublicacion'
        ],
        where: where
    });

    if(result){
        var resultComunicadoView = await comunicadoViewModel.findOne({
            where:{
                comunicadoId:req.params.id,
                username: resultToken.username
            }
        });
        if(!resultComunicadoView){
            await comunicadoViewModel.create({
                comunicadoId:req.params.id,
                username: resultToken.username,
                visto:true,
                fechaVisto:Sequelize.literal(`GETDATE()`)
            });
        }
    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
    return;
});
exports.getComunicadosUsuario = getComunicadosUsuario;