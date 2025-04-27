'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const usuarioModel = require('../sequelize').Usuario;
const tipoCuentaModel = require('../sequelize').TipoCuenta;
const tipoDocumentoModel = require('../sequelize').TipoDocumento;
const usuarioModuloModel = require('../sequelize').UsuarioModulo;

const seguridadController = require('./seguridad.controller');

const haydukMailer = require('../../../lib/hayduk_mailer/hayduk_mailer');

var listUsuarios = awaitErrorHandlerFactory(async (req, res, next) => {
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var attributes = [
        'username',
        'nombresApellidos',
        'email',
        'tipoDocumentoId',
        'numeroDocumento',
        'tipoCuentaId',
        'tipoDocumentoIdEmpleado',
        'numeroDocumentoEmpleado',
        'nombresApellidosEmpleado',
        'rucEmpresa',
        'razonSocialEmpresa',
        'terminos',
        'superAdmin',
        'cuentaConfirmada',
        'telefono'
    ];

    var where = {};

    var search = req.query.search;
    if (search) {
        where = {
            [Op.or]: [
                { username: { [Op.like]: '%' + search + '%' } },
                { numeroDocumento: { [Op.like]: '%' + search + '%' } },
                { nombresApellidos: { [Op.like]: '%' + search + '%' } },
                { rucEmpresa: { [Op.like]: '%' + search + '%' } },
                { razonSocialEmpresa: { [Op.like]: '%' + search + '%' } },
            ]
        };
    }

    var tipoCuentaId = req.query.tipoCuentaId;
    if(tipoCuentaId){
        where.tipoCuentaId = tipoCuentaId;
    }

    var cuentaConfirmada = req.query.cuentaConfirmada;
    if(cuentaConfirmada){
        where.cuentaConfirmada = cuentaConfirmada;
    }

    var result = await usuarioModel.findAndCountAll({
        attributes: attributes,
        where: where,
        offset: offSet,
        limit: regPag,
        include:[
            { model: tipoDocumentoModel, as:'tipoDocumento' },
            { model: tipoCuentaModel, as:'tipoCuenta' },
            { model: tipoDocumentoModel, as:'tipoDocumentoEmpleado' }
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listUsuarios = listUsuarios;

var getUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var attributes = [
        'username',
        'nombresApellidos',
        'email',
        'tipoDocumentoId',
        'numeroDocumento',
        'tipoCuentaId',
        'tipoDocumentoIdEmpleado',
        'numeroDocumentoEmpleado',
        'nombresApellidosEmpleado',
        'rucEmpresa',
        'razonSocialEmpresa',
        'terminos',
        'superAdmin',
        'cuentaConfirmada',
        'telefono'
    ];

    var result = await usuarioModel.findOne({
        attributes: attributes,
        where: {
            username: req.params.username
        },
        include:[
            { model: tipoDocumentoModel, as:'tipoDocumento' },
            { model: tipoCuentaModel, as:'tipoCuenta' },
            { model: tipoDocumentoModel, as:'tipoDocumentoEmpleado' }
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getUsuario = getUsuario;

var addUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username,
        nombresApellidos,
        email,
        tipoDocumentoId,
        numeroDocumento,
        tipoCuentaId,
        tipoDocumentoIdEmpleado,
        numeroDocumentoEmpleado,
        nombresApellidosEmpleado,
        rucEmpresa,
        razonSocialEmpresa,
        terminos,
        password,
        cuentaConfirmada,
        superAdmin,
        telefono } = req.body;
        
    var iv = util.cryptoGanerateRandomBytes(16);
    var key = config.app.module.seguridad.crypto.key;
    var algorithm = config.app.module.seguridad.crypto.algorithm;
    var encryptedValor = util.cryptoEncryptWithIV(password,algorithm, key, iv);

    var data = {
        username,
        nombresApellidos,
        email,
        tipoDocumentoId,
        numeroDocumento,
        tipoCuentaId,
        terminos,
        superAdmin:superAdmin,
        cuentaConfirmada:cuentaConfirmada,
        password:encryptedValor.encryptedData,
        iv:encryptedValor.iv,
        telefono,
        compliance:false,
        fechaAceptacionCompliance:null
    };

    if(tipoDocumentoIdEmpleado){
        data.tipoDocumentoIdEmpleado = tipoDocumentoIdEmpleado;
    }

    if(numeroDocumentoEmpleado){
        data.numeroDocumentoEmpleado = numeroDocumentoEmpleado;
    }

    if(nombresApellidosEmpleado){
        data.nombresApellidosEmpleado = nombresApellidosEmpleado;
    }

    if(rucEmpresa){
        data.rucEmpresa = rucEmpresa;
    }

    if(razonSocialEmpresa){
        data.razonSocialEmpresa = razonSocialEmpresa;
    }

    //Validamos si el nombre de usuario ya esta registrado
    var result = await usuarioModel.findOne({
        where: {
            username: username
        }
    });

    if (result === null) {
        var resultAdd = await usuarioModel.create(data);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {username}));
        // Envio de la notificacion
        
        try{
            var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
            var type = 'html';
            var to = username;
            var asunto = "[Pescando con Hayduk] - Bienvenido"
            var mensajeHTML = util.getEmailHtmlTemplate('new-account.html');
            mensajeHTML = mensajeHTML.replace("{{nombre}}",resultAdd.nombresApellidos);
            
            var imageBinaryBuffer = util.getEmailLogo();

            var attachments = [
                {
                filename: 'logo-email.png',
                value: imageBinaryBuffer
                }
            ];
            var resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
            var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, null, resultAttachments);
            
            console.log("Enviado email registro" + " - " + resultSendMail.messageId);
            logger.info("Enviado email registro" + " - " + resultSendMail.messageId);

            if(cuentaConfirmada){
                var to = username;
                var asunto = "[Pescando con Hayduk] - Cuenta Confirmada"
                var mensajeHTML = util.getEmailHtmlTemplate('confirm-account.html');
                mensajeHTML = mensajeHTML.replace("{{nombre}}",resultAdd.nombresApellidos);
                var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, null, resultAttachments);
            
                console.log("Enviado email cuentaConfirmada" + " - " + resultSendMail.messageId);
                logger.info("Enviado email cuentaConfirmada" + " - " + resultSendMail.messageId);
            }
        }catch(errMail){
            console.log("Error email", errMail);
            logger.error(JSON.stringify(errMail));
        }
    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_DUPLICADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_DUPLICADO(`Ya existe un Usuario con usuario = ${username}`), null));
    }
});
exports.addUsuario = addUsuario;

var editUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var { nombresApellidos,
        email,
        password,
        tipoDocumentoId,
        numeroDocumento,
        tipoCuentaId,
        tipoDocumentoIdEmpleado,
        numeroDocumentoEmpleado,
        nombresApellidosEmpleado,
        rucEmpresa,
        razonSocialEmpresa,
        cuentaConfirmada,
        superAdmin,
        telefono} = req.body;

    var { username } = req.params;

    var data = {
        nombresApellidos,
        email,
        tipoDocumentoId,
        numeroDocumento,
        tipoCuentaId,
        tipoDocumentoIdEmpleado,
        numeroDocumentoEmpleado,
        nombresApellidosEmpleado,
        rucEmpresa,
        razonSocialEmpresa,
        cuentaConfirmada,
        superAdmin,
        telefono
    };

    var result = await usuarioModel.findOne({
        where: {
            username: username
        }
    });

    if (result) {
        var cuentaConfirmadaAntes = result.cuentaConfirmada;
        if(password && password != ''){
            var iv = util.cryptoGanerateRandomBytes(16);
            var key = config.app.module.seguridad.crypto.key;
            var algorithm = config.app.module.seguridad.crypto.algorithm;
            var encryptedValor = util.cryptoEncryptWithIV(password,algorithm, key, iv);

            data.password = encryptedValor.encryptedData;
            data.iv = encryptedValor.iv;
        }

        var resultUpdate = await result.update(data);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {username}));

        // Envio de la notificacion de confirmación de cuenta
        if(!cuentaConfirmadaAntes && cuentaConfirmada){
            try{
                var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
                var type = 'html';
                var to = username;
                var asunto = "[Pescando con Hayduk] - Cuenta Confirmada"
                var mensajeHTML = util.getEmailHtmlTemplate('confirm-account.html');
                mensajeHTML = mensajeHTML.replace("{{nombre}}",resultUpdate.nombresApellidos);
    
                var imageBinaryBuffer = util.getEmailLogo();
    
                var attachments = [
                    {
                    filename: 'logo-email.png',
                    value: imageBinaryBuffer
                    }
                ];
                var resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
                var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, null, resultAttachments);
                
                console.log("Enviado email cuentaConfirmada" + " - " + resultSendMail.messageId);
                logger.info("Enviado email cuentaConfirmada" + " - " + resultSendMail.messageId);
    
            }catch(errMail){
                console.log("Error email", errMail);
                logger.error(JSON.stringify(errMail));
            }
        }
    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
    }

});
exports.editUsuario = editUsuario;

var confirmarCuentaUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var { tipoDocumentoIdEmpleado,
        numeroDocumentoEmpleado,
        nombresApellidosEmpleado,
        rucEmpresa,
        razonSocialEmpresa} = req.body;
    var { username } = req.params;

    var data = {
        tipoDocumentoIdEmpleado,
        numeroDocumentoEmpleado,
        nombresApellidosEmpleado,
        rucEmpresa,
        razonSocialEmpresa,
        cuentaConfirmada:1
    };

    var result = await usuarioModel.findOne({
        where: {
            username: username
        }
    });

    if (result) {
        var resultUpdate = await result.update(data);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultUpdate));
    
        // Envio de la notificacion
        try{
            var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
            var type = 'html';
            var to = username;
            var asunto = "[Pescando con Hayduk] - Cuenta Confirmada"
            var mensajeHTML = util.getEmailHtmlTemplate('confirm-account.html');

            var imageBinaryBuffer = util.getEmailLogo();
            var attachments = [
                {
                filename: 'logo-email.png',
                value: imageBinaryBuffer
                }
            ];
            var resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
            var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, null, resultAttachments);
            
            console.log("Enviado email - confirmarCuentaUsuario" + " - " + resultSendMail.messageId);
            logger.info("Enviado email - confirmarCuentaUsuario" + " - " + resultSendMail.messageId);

        }catch(errMail){
            console.log("Error email", errMail);
            logger.error(JSON.stringify(errMail));
        }
    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
    }

});
exports.confirmarCuentaUsuario = confirmarCuentaUsuario;

var deleteUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username } = req.params;
    //Obtenemos los Ids finales a eliminar
    var result = await usuarioModel.findOne({
        where: {
            username: username
        }
    });
    
    if (result) {
        var resultDelete = await usuarioModel.destroy({
            where: {
                username: username
            }
        });

        if(resultDelete){
            
            await usuarioModuloModel.destroy({
                where: {
                    username: username
                }
            });
            
            await seguridadController.sendMailDeleteUsuario(result.username, result.nombresApellidos);

            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
            return;
        }
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
});
exports.deleteUsuario = deleteUsuario;

var confirmarUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username } = req.body;

    //Obtenemos los Ids finales a eliminar
    var result = await usuarioModel.findOne({
        where: {
            username: username,
            cuentaConfirmada:0
        }
    });

    if (result) {
        try{
            var resultUpdate = await usuarioModel.update({
                cuentaConfirmada:1
            },
            {
                where: {
                    username: username
                }
            });

            var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
            var type = 'html';

            var imageBinaryBuffer = util.getEmailLogo();
            var attachments = [
                {
                filename: 'logo-email.png',
                value: imageBinaryBuffer
                }
            ];
            var resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
            
            var username = result.username;
            var nombresApellidos = result.nombresApellidos;

            var to = username;
            var asunto = "[Pescando con Hayduk] - Cuenta Confirmada"
            var mensajeHTML = util.getEmailHtmlTemplate('confirm-account.html');

            mensajeHTML = mensajeHTML.replace("{{nombre}}",nombresApellidos);

            var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, null, resultAttachments);
            console.log(username + " - confirmarCuentaUsuario - " + resultSendMail.messageId);
            logger.info(username + " - confirmarCuentaUsuario - " + resultSendMail.messageId);

            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultUpdate));
            return;

        }catch(errMail){
            console.log("Error email - confirmarCuentaUsuario - ", errMail);
            logger.error(JSON.stringify(errMail));

            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_NO_PROCESADO, constants.MENSAJE.APLICACION.ERROR_NO_PROCESADO, null));
            return;
        }
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
});
exports.confirmarUsuario = confirmarUsuario;