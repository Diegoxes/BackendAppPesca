'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');
const request = require("request");

const haydukMailer = require('../../../lib/hayduk_mailer/hayduk_mailer');

const usuarioModel = require('../sequelize').Usuario;
const logAccesoModel = require('../sequelize').LogAcceso;
const tipoCuentaModel = require('../sequelize').TipoCuenta;
const tipoCuentaModuloModel = require('../sequelize').TipoCuentaModulo;
const usuarioModuloModel = require('../sequelize').UsuarioModulo;
const usuarioAceptacionTerminosModel = require('../sequelize').UsuarioAceptacionTerminos;
const usuarioMotivoEliminacionModel = require('../sequelize').UsuarioMotivoEliminacion;

const { RateLimiterRedis } = require('rate-limiter-flexible');
const maxWrongAttemptsByIPperDay = 100;
const maxConsecutiveFailsByUsernameAndIP = 10;

const redis = require('redis');
const { UsuarioMotivoEliminacion } = require('../sequelize');
var redisDBConn = Object.assign({},config.redis.dbHaydukContigo);
redisDBConn.enable_offline_queue = false;
const redisClient = redis.createClient(redisDBConn);
redisClient.on("error", function(error) {
    console.error(error);
    logger.error(error);
});

const limiterSlowBruteByIP = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'covidapp-login-fail-ip-per-day',
    points: maxWrongAttemptsByIPperDay,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
});

const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'covidapp-login-fail-consecutive-username-and-ip',
    points: maxConsecutiveFailsByUsernameAndIP,
    duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
    blockDuration: 60 * 60, // Block for 1 hour
});

const getUsernameIPkey = (username, ip) => `${username}-${ip}`;

var encryptPassword = awaitErrorHandlerFactory(async (req, res, next) => {
    var { p } = req.body;
    var passwordEncrpyted = util.generarContrasenaHash(p);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, passwordEncrpyted));
});
exports.encryptPassword = encryptPassword;

var encryptTexto = awaitErrorHandlerFactory(async (req, res, next) => {
    var { texto } = req.body;
    var textoEncrpyted = util.cryptoEncrypt(texto);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, textoEncrpyted));
});
exports.encryptTexto = encryptTexto;

var generateRandomBytes = awaitErrorHandlerFactory(async (req, res, next) => {
    var { number } = req.body;
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, util.cryptoGanerateRandomBytes(number)));
});
exports.generateRandomBytes = generateRandomBytes;

var addUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var recaptcha = req.body.recaptcha;
    //Validamos el recaptcha si es que llega direferente de null
    if(recaptcha){
        var remoteAddress = req.connection.remoteAddress;
        if(!await this.validarRecaptcha(remoteAddress, recaptcha)){
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_RECAPTCHA, constants.MENSAJE.APLICACION.ERROR_RECAPTCHA, null));
            return;
        }
    }

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
        superAdmin:0,
        cuentaConfirmada:0,
        password:encryptedValor.encryptedData,
        iv:encryptedValor.iv,
        telefono,
        compliance:0,
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

    if(tipoCuentaId == 'INV'){
        data.cuentaConfirmada = 1;
    }

    //Validamos si el nombre de usuario ya esta registrado
    var result = await usuarioModel.findOne({
        where: {
            username: username
        }
    });

    if (result === null) {
        var resultAdd = await usuarioModel.create(data);

        //Insertamos los accesos
        var resultLstTipoCuentaModulo = await tipoCuentaModuloModel.findAll({
            where: {
                tipoCuentaId:resultAdd.tipoCuentaId
            }
        });

        var dataInsert = [];
        for(var i=0; i < resultLstTipoCuentaModulo.length; i++){
            var dataTipoCuentaModulo = resultLstTipoCuentaModulo[i].dataValues;
            dataInsert.push({
                username:resultAdd.username,
                moduloId:dataTipoCuentaModulo.moduloId       
            });
        }

        await usuarioModuloModel.bulkCreate(dataInsert);

        //Generamos el token de acceso
        var dataToken = {
            username: resultAdd.username,
            nombresApellidos: resultAdd.nombresApellidos,
            tipoCuentaId: resultAdd.tipoCuentaId,
            cuentaConfirmada: resultAdd.cuentaConfirmada,
            superAdmin: 0
        }

        if(rucEmpresa){
            dataToken.rucEmpresa = rucEmpresa;
        }
    
        if(razonSocialEmpresa){
            dataToken.razonSocialEmpresa = razonSocialEmpresa;
        }

        let authToken = util.generateJWTAuthToken(dataToken, config.jwt.tokenTime);
        var dataRenewToken = {
            username: resultAdd.username,
            aT:authToken
        }

        let renewToken = util.generateJWTAuthToken(dataRenewToken, config.jwt.renewTokenTime);
        dataToken.aT = authToken;
        dataToken.rT = renewToken;

        // if (resultAdd.tipoCuentaId == "BAH" || resultAdd.tipoCuentaId == "ARM") {
        //     guardarCompliance(username, nombresApellidos)
        // }

        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataToken));
        
        //Enviamos el correo eletrónico de bienvenida
        try{
            // Enviamos el correo de bienvenida
            var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
            var type = 'html';
            var to = username;
            var cco = config.app.module.seguridad.registroUsuario.cco;
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
            var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, cco, resultAttachments);
            
            console.log("Enviado email registro" + " - " + resultSendMail.messageId);
            logger.info("Enviado email registro" + " - " + resultSendMail.messageId);

            if(tipoCuentaId == 'INV'){
                var type = 'html';
                var to = resultAdd.username;
                var asunto = "[Pescando con Hayduk] - Cuenta Confirmada"
                var mensajeHTML = util.getEmailHtmlTemplate('confirm-account.html');
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
                
                console.log("Enviado email confirmacion INV" + " - " + resultSendMail.messageId);
                logger.info("Enviado email confirmacion INV" + " - " + resultSendMail.messageId);
            }

        }catch(errMail){
            console.log("Error email", errMail);
            logger.error(JSON.stringify(errMail));
        }

        var resultTipoCuenta = await tipoCuentaModel.findOne({where:{id:resultAdd.tipoCuentaId}});
        if(resultTipoCuenta != null && resultTipoCuenta.notificarRegistroA != null && resultTipoCuenta.notificarRegistroA != ''){
            try{
                // Enviamos el correo de bienvenida
                var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
                var type = 'html';
                var to = resultTipoCuenta.notificarRegistroA;
                var asunto = "[Pescando con Hayduk] - Cración de Cuenta - "+resultTipoCuenta.nombre;
                var mensajeHTML = `Estimados, se ha registrado el siguiente ${resultTipoCuenta.nombre} con los siguiente datos:<br>
                <br>
                <b>Nombres:</b> ${resultAdd.nombresApellidos}<br>
                <b>Correo Electrónico:</b> ${resultAdd.username}<br>
                <br>
                Saludos, Pescando con Hayduk.`;
    
                var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, null, []);
                
                console.log("Enviado email" + " - " + resultSendMail.messageId);
                logger.info("Enviado email" + " - " + resultSendMail.messageId);
    
            }catch(errMail){
                console.log("Error email", errMail);
                logger.error(JSON.stringify(errMail));
            }
        }

    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_DUPLICADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_DUPLICADO(`Ya existe una cuenta con correo electrónico = ${username}`), null));
    }

});
exports.addUsuario = addUsuario;

var existsEmail = awaitErrorHandlerFactory(async (req, res, next) => {

    var { username } = req.body;
    var resultUsuario = await usuarioModel.findOne({ 
        where: { 
            username: username 
        } 
    });

    if(!resultUsuario){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_DUPLICADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_DUPLICADO(`Ya existe una cuenta con el correo electrónico = ${username}`), null));
    }
});
exports.existsEmail = existsEmail;

var loginUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username, password, recaptcha } = req.body;

    var ipAddr = req.ip;
    var usernameIPkey = getUsernameIPkey(username, ipAddr);
    const [resUsernameAndIP, resSlowByIP] = await Promise.all([
        limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
        limiterSlowBruteByIP.get(ipAddr),
    ]);

    let retrySecs = 0;
    // Check if IP or Username + IP is already blocked
    if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
        retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP) {
        retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
        res.status(constants.CODIGO.SERVIDOR.ERROR_TOO_MANY_REQUEST);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_TOO_MANY_REQUEST, constants.MENSAJE.SERVIDOR.ERROR_TOO_MANY_REQUEST, null));
        return;
    }

    //Validamos el recaptcha si es que llega direferente de null
    if(recaptcha){
        var remoteAddress = req.connection.remoteAddress;
        if(!await this.validarRecaptcha(remoteAddress, recaptcha)){
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_RECAPTCHA, constants.MENSAJE.APLICACION.ERROR_RECAPTCHA, null));
            return;
        }
    }

    var resultUsuario = await usuarioModel.findOne({ 
        where: { 
            username: username 
        } 
    });

    if(resultUsuario != null){
        var algorithm = config.app.module.seguridad.crypto.algorithm;
        var key = config.app.module.seguridad.crypto.key;
        var valor = resultUsuario.password;
        var iv2 = resultUsuario.iv;
        var valorDecrypted = util.cryptoDecryptWithIV(valor, algorithm, key, iv2);

        if(password == valorDecrypted){
            // Reset on successful authorisation
            if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
                await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
              }

            //Eliminamos el registro de login porque inicio correctamente
            await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);

            var dataToken = {
                username: resultUsuario.username,
                nombresApellidos: resultUsuario.nombresApellidos,
                tipoCuentaId: resultUsuario.tipoCuentaId,
                cuentaConfirmada: resultUsuario.cuentaConfirmada,
                superAdmin: resultUsuario.superAdmin,
                rucEmpresa: resultUsuario.rucEmpresa,
                razonSocialEmpresa:resultUsuario.razonSocialEmpresa,
                embedded:false,
                notificarApp:resultUsuario.notificarApp,
                notificar2doPlano:resultUsuario.notificar2doPlano,
                notificarEmail:resultUsuario.notificarEmail,
                notificarSMS:resultUsuario.notificarSMS,
                notificarWS:resultUsuario.notificarWS
            }


            let authToken = util.generateJWTAuthToken(dataToken, config.jwt.tokenTime);

            var dataRenewToken = {
                username: resultUsuario.username,
                aT:authToken
            }

            let renewToken = util.generateJWTAuthToken(dataRenewToken, config.jwt.renewTokenTime);

            dataToken.aT = authToken;
            dataToken.rT = renewToken;

            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataToken));
            return;

        }else{
            // Consume 1 point from limiters on wrong attempt and block if limits reached by IP and User
            try {
                const promises = [limiterSlowBruteByIP.consume(ipAddr), limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey)];
                await Promise.all(promises);

                res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
                res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
                return;

            } catch (rlRejected) {
                if (rlRejected instanceof Error) {
                  throw rlRejected;
                } else {
                    res.status(constants.CODIGO.SERVIDOR.ERROR_TOO_MANY_REQUEST);
                    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_TOO_MANY_REQUEST, constants.MENSAJE.SERVIDOR.ERROR_TOO_MANY_REQUEST, null));
                    return;
                }
            }
        }
    }

    //Si el usuario no existe avanzamos el contador de limitador por IP
    const promises = [limiterSlowBruteByIP.consume(ipAddr)];
    await Promise.all(promises);

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.loginUsuario = loginUsuario;

var renewToken = awaitErrorHandlerFactory(async (req, res, next) => {
    var tokenRenew = req.body.rT;
    var token = req.headers.authorization.split(" ")[1];
    var from = req.headers.from;

    var verifRenewToken = null;
    try{
        verifRenewToken = util.verifyJWTAuthToken(tokenRenew);

        if(verifRenewToken.aT == token){
            if( from == verifRenewToken.username &&
                verifRenewToken.iat < verifRenewToken.exp){
                    
                var resultUsuario = await usuarioModel.findOne({
                    where:{
                        username: from
                    }
                });
    
                if(resultUsuario != null){
                    var dataToken = {
                        username: resultUsuario.username,
                        nombresApellidos: resultUsuario.nombresApellidos,
                        tipoCuentaId: resultUsuario.tipoCuentaId,
                        cuentaConfirmada: resultUsuario.cuentaConfirmada,
                        superAdmin: resultUsuario.superAdmin,
                        rucEmpresa: resultUsuario.rucEmpresa,
                        razonSocialEmpresa:resultUsuario.razonSocialEmpresa,
                        embedded:false,
                        notificarApp:resultUsuario.notificarApp,
                        notificar2doPlano:resultUsuario.notificar2doPlano,
                        notificarEmail:resultUsuario.notificarEmail,
                        notificarSMS:resultUsuario.notificarSMS,
                        notificarWS:resultUsuario.notificarWS
                    }
                    let authToken = util.generateJWTAuthToken(dataToken, config.jwt.tokenTime);
        
                    var dataRenewToken = {
                        username: resultUsuario.username,
                        aT:authToken
                    }
                    let renewToken = util.generateJWTAuthToken(dataRenewToken, config.jwt.renewTokenTime);
        
                    dataToken.aT = authToken;
                    dataToken.rT = renewToken;
        
                    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataToken));
                    return;
                }
            }
        }
    }catch(err){
        logger.error(err);
        res.status(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED, 
            constants.MENSAJE.SERVIDOR.ERROR_UNAUTHORIZED, 
            null));
        return false;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED, 
        constants.MENSAJE.SERVIDOR.ERROR_UNAUTHORIZED, 
        null));
});
exports.renewToken = renewToken;

var addLogAcceso = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username, moduloId, detalle } = req.body;

    var data = {
        username, 
        moduloId, 
        detalle
    };

    var resultAdd = await logAccesoModel.create(data);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultAdd));
    return;
});
exports.addLogAcceso = addLogAcceso;

var recoverPassword = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username } = req.body;

    var resultUsuario = await usuarioModel.findOne({
        where:{
            username: username
        }
    });

    if(resultUsuario != null){
        var randomPassword = util.generateRandomPassword(8);
        var iv = util.cryptoGanerateRandomBytes(16);
        var key = config.app.module.seguridad.crypto.key;
        var algorithm = config.app.module.seguridad.crypto.algorithm;
        var encryptedValor = util.cryptoEncryptWithIV(randomPassword,algorithm, key, iv);

        var data = {
            password: encryptedValor.encryptedData,
            iv:encryptedValor.iv
        }

        var resultUpdate = await resultUsuario.update(data);
        if(resultUpdate != null){
            // Envio de la notificacion
            try{
                var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
                // Enviamos el correo de bienvenida
                var type = 'html';
                var to = username;
                var asunto = "[Pescando con Hayduk] - Contraseña Reseteada"
                var mensajeHTML = util.getEmailHtmlTemplate('reset-password.html');

                mensajeHTML = mensajeHTML.replace("{{nombre}}",resultUsuario.nombresApellidos);
                mensajeHTML = mensajeHTML.replace("{{contrasena_nueva}}",randomPassword);

                var imageBinaryBuffer = util.getEmailLogo();
                var attachments = [
                    {
                    filename: 'logo-email.png',
                    value: imageBinaryBuffer
                    }
                ];
                var resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
                var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, null, resultAttachments);
                
                console.log("Enviado email" + " - " + resultSendMail.messageId);
                logger.info("Enviado email" + " - " + resultSendMail.messageId);

                res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
                return;
            }catch(errMail){
                console.log("Error email", errMail);
                logger.error(JSON.stringify(errMail));

                res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
                res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_NO_PROCESADO, constants.MENSAJE.APLICACION.ERROR_NO_PROCESADO, null));
                return;
            }
        }
    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
    return;
});
exports.recoverPassword = recoverPassword;

var getDatosUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var from = req.headers.from;
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    if(from != resultToken.username){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {}));
        return;
    }

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
        'telefono',
        'notificarApp',
        'notificar2doPlano',
        'notificarEmail',
        'notificarSMS',
        'notificarWS'
    ];
    var resultUsuario = await usuarioModel.findOne({
        attributes:attributes,
        where:{
            username: resultToken.username
        }
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultUsuario));
    return;

});
exports.getDatosUsuario = getDatosUsuario;

var editDatosUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    var from = req.headers.from;

    if(resultToken.username != from){
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
        return;
    }

    var { nombresApellidos, email, telefono } = req.body;

    var resultUsuario = await usuarioModel.findOne({ 
        where: { 
            username: from 
        } 
    });

    if(resultUsuario != null){
        var data = {
            nombresApellidos,
            email,
            telefono
        };

        await resultUsuario.update(data);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
});
exports.editDatosUsuario = editDatosUsuario;

var editPasswordUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    var from = req.headers.from;
    
    if(resultToken.username != from){
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
        return;
    }

    var { actualPassword, password } = req.body;

    var resultUsuario = await usuarioModel.findOne({ 
        where: { 
            username: from 
        } 
    });

    if(resultUsuario != null){
        var algorithm = config.app.module.seguridad.crypto.algorithm;
        var key = config.app.module.seguridad.crypto.key;
        var valor = resultUsuario.password;
        var iv2 = resultUsuario.iv;
        var valorDecrypted = util.cryptoDecryptWithIV(valor, algorithm, key, iv2);

        if(actualPassword == valorDecrypted){
            var iv = util.cryptoGanerateRandomBytes(16);
            var key = config.app.module.seguridad.crypto.key;
            var algorithm = config.app.module.seguridad.crypto.algorithm;
            var encryptedValor = util.cryptoEncryptWithIV(password,algorithm, key, iv);

            var data = {
                password: encryptedValor.encryptedData,
                iv:encryptedValor.iv
            }

            await resultUsuario.update(data);
            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
            return;

        }else{
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, constants.MENSAJE.APLICACION.ERROR_CAMPO_NO_VALIDO('La contraseña ingresada no es valida.'), null));
            return;
        }
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
});
exports.editPasswordUsuario = editPasswordUsuario;

var validarAccesoUsuarioModulo = async function(req, res, soloSuperAdmin, arrModulosIds){
    
    try{
        var token = req.headers.authorization.split(" ")[1];
        var resultToken = util.verifyJWTAuthToken(token);

        var resultUsuario = await usuarioModel.findOne({ 
            where: { 
                username: resultToken.username 
            } 
        });

        if(resultUsuario == null){
            res.status(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED);
            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED,
                constants.MENSAJE.SERVIDOR.ERROR_UNAUTHORIZED, 
             null));
            return false;
        }

        if(soloSuperAdmin){
            if(!resultUsuario.superAdmin){
                res.status(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED);
                res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED,
                    constants.MENSAJE.SERVIDOR.ERROR_UNAUTHORIZED, 
                null));
                return false;
            }else{
                return true;
            }
        }else{
            if(resultUsuario.superAdmin){
                return true;
            }else{
                var resultModulos = await usuarioModuloModel.findAll({
                    where: {
                        moduloId: arrModulosIds,
                        username: resultToken.username 
                    }
                });

                if(resultModulos.length > 0 && resultUsuario.cuentaConfirmada){
                    return true;
                }else{
                    res.status(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED);
                    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED,
                        constants.MENSAJE.SERVIDOR.ERROR_UNAUTHORIZED, 
                     null));
                    return false;
                }
            }
        }
    }catch(err){
        console.log(err);
        logger.error(err);

        res.status(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED,
            constants.MENSAJE.SERVIDOR.ERROR_UNAUTHORIZED, 
            null));
        return false;
    }
    
};
exports.validarAccesoUsuarioModulo = validarAccesoUsuarioModulo;

var generateAccessTokenEmbeddedApp = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username, password, usernameUsuario, rucUsuario } = req.body;

    var resultUsuario = await usuarioModel.findOne({ 
        where: { 
            username: username 
        } 
    });

    if(resultUsuario != null){
        var algorithm = config.app.module.seguridad.crypto.algorithm;
        var key = config.app.module.seguridad.crypto.key;
        var valor = resultUsuario.password;
        var iv2 = resultUsuario.iv;
        var valorDecrypted = util.cryptoDecryptWithIV(valor, algorithm, key, iv2);

        if(password == valorDecrypted){
            //Validamos que tiene el permiso de embedded
            var resultModulos = await usuarioModuloModel.findAll({
                where: {
                    moduloId: ['covidapp-embeddedapp'],
                    username:username
                }
            });

            if(resultModulos.length > 0 && resultUsuario.cuentaConfirmada){
                var resultUsuarioDestino = null;
                if(usernameUsuario){
                    var resultUsuarioDestino = await usuarioModel.findOne({ 
                        where: { 
                            username: usernameUsuario,
                            tipoCuentaId: 'ARM'
                        } 
                    });
                }

                if(resultUsuarioDestino === null && rucUsuario){
                    resultUsuarioDestino = await usuarioModel.findOne({ 
                        where: { 
                            rucEmpresa: rucUsuario,
                            tipoCuentaId: 'ARM'
                        } 
                    });
                }

                if(resultUsuarioDestino === null){
                    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
                    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
                    return;
                }

                var dataToken = {
                    username: resultUsuarioDestino.username,
                } 

                let authToken = util.generateJWTAuthToken(dataToken, config.jwt.tokenTimeEmbededdApp);
                res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, {aT:authToken}));
                return;
                
            }else{
                res.status(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED);
                res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED, 
                    constants.MENSAJE.SERVIDOR.ERROR_UNAUTHORIZED, 
                 null));
                return false;
            }
        }else{
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
            return;
        }
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.generateAccessTokenEmbeddedApp = generateAccessTokenEmbeddedApp;

var loginEmbeddedApp = awaitErrorHandlerFactory(async (req, res, next) => {
    var token = req.body.loginToken;

    try{
        var verifyEmbeddedToken = util.verifyJWTAuthToken(token);

        var resultUsuario = await usuarioModel.findOne({
            where:{
                username: verifyEmbeddedToken.username
            }
        });

        var dataToken = {
            username: resultUsuario.username,
            nombresApellidos: resultUsuario.nombresApellidos,
            tipoCuentaId: resultUsuario.tipoCuentaId,
            cuentaConfirmada: resultUsuario.cuentaConfirmada,
            superAdmin: resultUsuario.superAdmin,
            embedded:true
        }
        let authToken = util.generateJWTAuthToken(dataToken, config.jwt.tokenTime);

        var dataRenewToken = {
            username: resultUsuario.username,
            aT:authToken
        }
        let renewToken = util.generateJWTAuthToken(dataRenewToken, config.jwt.renewTokenTime);

        dataToken.aT = authToken;
        dataToken.rT = renewToken;

        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataToken));
        return;
        
    }catch(err){
        logger.error(err);
        res.status(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED, 
            constants.MENSAJE.SERVIDOR.ERROR_UNAUTHORIZED, 
            null));
        return false;
    }
});
exports.loginEmbeddedApp = loginEmbeddedApp;

var registrarArmador = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username,
        password,
        telefono,
        nombresApellidos,
        tipoDocumentoId,
        numeroDocumento,
        rucEmpresa,
        razonSocialEmpresa
        } = req.body;
    
    var tipoCuentaId = 'ARM';

    var iv = util.cryptoGanerateRandomBytes(16);
    var key = config.app.module.seguridad.crypto.key;
    var algorithm = config.app.module.seguridad.crypto.algorithm;
    var encryptedValor = util.cryptoEncryptWithIV(password,algorithm, key, iv);

    var data = {
        username,
        nombresApellidos,
        email:"",
        tipoDocumentoId,
        numeroDocumento,
        tipoCuentaId,
        terminos:1,
        superAdmin:0,
        password:encryptedValor.encryptedData,
        iv:encryptedValor.iv,
        telefono,
        rucEmpresa: rucEmpresa,
        razonSocialEmpresa: razonSocialEmpresa,
        cuentaConfirmada: 1
    };

    //Validamos si el nombre de usuario ya esta registrado
    var result = await usuarioModel.findOne({
        where: {
            username: username
        }
    });

    if (result === null) {
        var resultAdd = await usuarioModel.create(data);

        //Insertamos los accesos
        var resultLstTipoCuentaModulo = await tipoCuentaModuloModel.findAll({
            where: {
                tipoCuentaId:resultAdd.tipoCuentaId
            }
        });

        var dataInsert = [];
        for(var i=0; i < resultLstTipoCuentaModulo.length; i++){
            var dataTipoCuentaModulo = resultLstTipoCuentaModulo[i].dataValues;
            dataInsert.push({
                username:resultAdd.username,
                moduloId:dataTipoCuentaModulo.moduloId       
            });
        }

        await usuarioModuloModel.bulkCreate(dataInsert);

        //Generamos el token de acceso
        var dataToken = {
            username: resultAdd.username,
            nombresApellidos: resultAdd.nombresApellidos,
            tipoCuentaId: resultAdd.tipoCuentaId,
            cuentaConfirmada: resultAdd.cuentaConfirmada
        }

        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataToken));
        
        //Enviamos el correo eletrónico
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

            var to = resultAdd.username;
            var asunto = "[Pescando con Hayduk] - Cuenta Confirmada"
            var mensajeHTML = util.getEmailHtmlTemplate('confirm-account.html');
            mensajeHTML = mensajeHTML.replace("{{nombre}}",resultAdd.nombresApellidos);

            var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, null, resultAttachments);
            
            console.log("Enviado email confirmacion" + " - " + resultSendMail.messageId);
            logger.info("Enviado email confirmacion" + " - " + resultSendMail.messageId);

        }catch(errMail){
            console.log("Error email", errMail);
            logger.error(JSON.stringify(errMail));
        }

    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_DUPLICADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_DUPLICADO(`Ya existe una cuenta con correo electrónico = ${username}`), null));
    }

});
exports.registrarArmador = registrarArmador;

var validarRecaptcha = async function(remoteAddress, token){
    return new Promise((resolve, reject) => {
        try{
            const url =  `https://www.google.com/recaptcha/api/siteverify?secret=${config.recaptcha.secretKey}&response=${token}&remoteip=${remoteAddress}`;
            request(url, function(err, response, body){
                //the body is the data that contains success message
                body = JSON.parse(body);
                //check if the validation failed
                if(body.success !== undefined && !body.success){
                    console.log("recaptcha failed!")
                    resolve(false);
                }

                resolve(true);
              })
        }catch(err){
            console.log(err);
            logger.error(err);
    
            res.status(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED);
            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED,
                constants.MENSAJE.SERVIDOR.ERROR_UNAUTHORIZED, 
                null));
            reject(false);
        }
    });
    
    
};
exports.validarRecaptcha = validarRecaptcha;

var obtenerCompliance = awaitErrorHandlerFactory(async (req, res, next) => {
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var result = await usuarioModel.findOne({
        attributes:[
          'username',
          'nombresApellidos',
          'tipoCuentaId',
          'compliance',
          'fechaAceptacionCompliance'  
        ],
        where: {
          username: resultToken.username
        }
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.obtenerCompliance = obtenerCompliance;

var guardarCompliance = awaitErrorHandlerFactory(async (req, res, next) => {
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    

    var result = await usuarioModel.findOne({
        where: {
          username: resultToken.username
        }
    });

    if (result) {
        var dataUsuario = {
            compliance:true,
            fechaAceptacionCompliance: usuarioModel.sequelize.fn('GETDATE')
        };
        await result.update(dataUsuario);

        var dataUsuarioAceptacionTerminos = {
            id             : usuarioAceptacionTerminosModel.sequelize.literal(`NEWID()`),
            username       : resultToken.username,
            documento      : config.app.module.politicaCompliance.filename,
            fechaAceptacion: usuarioAceptacionTerminosModel.sequelize.fn('GETDATE')
        };
        await usuarioAceptacionTerminosModel.create(dataUsuarioAceptacionTerminos);

        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));

        sendMailCompliance(resultToken.username, resultToken.nombresApellidos);
        return;
    }
    
    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
});
exports.guardarCompliance = guardarCompliance;

var sendMailCompliance = async (username, nombresApellidos) => {
    // Envio de la notificacion
    try{
      var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
      var type = 'html';
      var to = username;
      var cco = config.app.module.politicaCompliance.email.cco;
      var asunto = "[Pescando con Hayduk] - Política de Compliance Corporativo"
      var mensajeHTML = util.getEmailHtmlTemplate('compliance.html');
      mensajeHTML = mensajeHTML.replace("{{nombre}}", nombresApellidos);
  
      var imageBinaryBuffer = util.getEmailLogo();
      var pdfBinaryBuffer   = util.getCompliance();
  
      var attachments = [
          {
            filename: 'logo-email.png',
            value: imageBinaryBuffer
          },
          {
            filename: config.app.module.politicaCompliance.filename,
            value: pdfBinaryBuffer
          }
      ];
      var resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
      var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, cco, resultAttachments);
      
      console.log("Enviado email" + " - " + resultSendMail.messageId);
      logger.info("Enviado email" + " - " + resultSendMail.messageId);
  
    }catch(errMail){
      console.log("Error email", errMail);
      logger.error(JSON.stringify(errMail));
    }
    
  }

  var deleteUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    
    var resultUsuario = await usuarioModel.findOne({
        where: {
          username: resultToken.username
        }
    });
    if (resultUsuario) {
        var { motivo, password } = req.body;
        
        var algorithm = config.app.module.seguridad.crypto.algorithm;
        var key = config.app.module.seguridad.crypto.key;
        var valor = resultUsuario.password;
        var iv2 = resultUsuario.iv;
        var valorDecrypted = util.cryptoDecryptWithIV(valor, algorithm, key, iv2);

        if(password == valorDecrypted){
            var username = resultUsuario.username;
            var nombresApellidos = resultUsuario.nombresApellidos;

            var where = {
                username: username
            }
            
            //Eliminamos los modulos del usuario
            await usuarioModuloModel.destroy({
                where:where
            });

            //Eliminamos la cuenta del usuario
            await resultUsuario.destroy();
            
            var data = {
                id: usuarioMotivoEliminacionModel.sequelize.literal(`NEWID()`),
                username: username,
                motivo: motivo,
                fecha: usuarioMotivoEliminacionModel.sequelize.literal(`GETDATE()`),
            }

            await UsuarioMotivoEliminacion.create(data);
            
            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));

            sendMailDeleteUsuario(username, nombresApellidos);
            return;
        }
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, "La contraseña ingresada no es valida.", null));
    return;

  });
  exports.deleteUsuario = deleteUsuario;

  var editNotificacionesUsuario = awaitErrorHandlerFactory(async (req, res, next) => {
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    var from = req.headers.from;

    if(resultToken.username != from){
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
        return;
    }

    var { notificarApp, notificar2doPlano, notificarSMS, notificarWS } = req.body;

    var resultUsuario = await usuarioModel.findOne({ 
        where: { 
            username: from 
        } 
    });

    if(resultUsuario != null){
        var data = {
            notificarApp,
            notificar2doPlano,
            notificarSMS,
            notificarWS
        };

        await resultUsuario.update(data);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
});
exports.editNotificacionesUsuario = editNotificacionesUsuario;

var sendMailDeleteUsuario = async (username, nombresApellidos) => {
    // Envio de la notificacion
    try{
        var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
        var type = 'html';
        var to = username;
        var cco = config.app.module.politicaCompliance.email.cco;
        var asunto = "[Pescando con Hayduk] - Confirmación de Baja de Cuenta"
        var mensajeHTML = util.getEmailHtmlTemplate('eliminacion-cuenta.html');
        mensajeHTML = mensajeHTML.replace("{{nombre}}", nombresApellidos);

        var imageBinaryBuffer = util.getEmailLogo();
        var attachments = [
            {
            filename: 'logo-email.png',
            value: imageBinaryBuffer
            }
        ];
        var resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
        var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, cco, resultAttachments);
        
        console.log("Enviado email" + " - " + resultSendMail.messageId);
        logger.info("Enviado email" + " - " + resultSendMail.messageId);

    }catch(errMail){
        console.log("Error email", errMail);
        logger.error(JSON.stringify(errMail));
    }

}
exports.sendMailDeleteUsuario = sendMailDeleteUsuario;

var solicitarDeleteAccount = awaitErrorHandlerFactory(async (req, res, next) => {
   
    
    var { username, password, motivo, recaptcha } = req.body;

    var ipAddr = req.ip;
    var usernameIPkey = getUsernameIPkey(username, ipAddr);
    const [resUsernameAndIP, resSlowByIP] = await Promise.all([
        limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
        limiterSlowBruteByIP.get(ipAddr),
    ]);

    let retrySecs = 0;
    // Check if IP or Username + IP is already blocked
    if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
        retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP) {
        retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
        res.status(constants.CODIGO.SERVIDOR.ERROR_TOO_MANY_REQUEST);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR_TOO_MANY_REQUEST, constants.MENSAJE.SERVIDOR.ERROR_TOO_MANY_REQUEST, null));
        return;
    }

    //Validamos el recaptcha si es que llega direferente de null
    if(recaptcha){
        var remoteAddress = req.connection.remoteAddress;
        if(!await this.validarRecaptcha(remoteAddress, recaptcha)){
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_RECAPTCHA, constants.MENSAJE.APLICACION.ERROR_RECAPTCHA, null));
            return;
        }
    }

    var resultUsuario = await usuarioModel.findOne({ 
        where: { 
            username: username 
        } 
    });

    if(resultUsuario != null){
        var algorithm = config.app.module.seguridad.crypto.algorithm;
        var key = config.app.module.seguridad.crypto.key;
        var valor = resultUsuario.password;
        var iv2 = resultUsuario.iv;
        var valorDecrypted = util.cryptoDecryptWithIV(valor, algorithm, key, iv2);

        if(password == valorDecrypted){
            // Envio de la notificacion
            try{
                var accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
                var type = 'html';
                var to = config.email.toSolicitudBajaCuenta;
                var asunto = "[Pescando con Hayduk] - Solicitud de Baja de Cuenta"

                var mensajeHTML = `Hola, tenemos una solicitud para dar de baja la siguiente cuenta:
                                    <br>
                                    <table>
                                    <tr>
                                    <th>Username:<th>
                                    <td>${resultUsuario.username}</td>
                                    </tr>
                                    <tr>
                                    <th>Nombres y Apellidos:<th>
                                    <td>${resultUsuario.nombresApellidos}</td>
                                    </tr>
                                    <tr>
                                    <th>Motivo:<th>
                                    <td>${motivo}</td>
                                    </tr>
                                    </table>
                                    <br>
                                    <br>
                                    Pescando con Hayduk`;

                var resultSendMail = await haydukMailer.sendEmail(accessTokenMail, config.email.username, to, type, asunto, mensajeHTML, null, null, null);
                
                console.log("Enviado email" + " - " + resultSendMail.messageId);
                logger.info("Enviado email" + " - " + resultSendMail.messageId);
            
                res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
                return;
            }catch(errMail){
                console.log("Error email", errMail);
                logger.error(JSON.stringify(errMail));

                res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
                res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
                return;
            }
           
        }else{
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
            return;
        }
    }

    //Si el usuario no existe avanzamos el contador de limitador por IP
    const promises = [limiterSlowBruteByIP.consume(ipAddr)];
    await Promise.all(promises);

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.solicitarDeleteAccount = solicitarDeleteAccount;



var loginRazonSocial = awaitErrorHandlerFactory(async (req, res,next) => {
    
    const authToken = req.headers.authorization.split(" ")[1];
    const { razonSocial,ruc } = req.body;

    if (!authToken || !razonSocial) {
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_PARAMETROS, "Token o razón social faltante", null));
        return;
    }

    let decodedToken;
    try {
        decodedToken = util.verifyJWTAuthToken(authToken);
    } catch (error) {
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_TOKEN_INVALIDO, "Token inválido o expirado", null));
        return;
    }

    const { username } = decodedToken;

    var resultUsuario = await usuarioModel.findOne({
        where: {
            username: username,
        }
    });

    if (!resultUsuario) {
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, "Razón social no válida para el usuario", null));
        return;
    }
    
    var dataToken = {
        username: resultUsuario.username,
        nombresApellidos: resultUsuario.nombresApellidos,
        tipoCuentaId: resultUsuario.tipoCuentaId,
        cuentaConfirmada: resultUsuario.cuentaConfirmada,
        superAdmin: resultUsuario.superAdmin,
        rucEmpresa: ruc,
        razonSocialEmpresa:razonSocial,
        embedded:false,
        notificarApp:resultUsuario.notificarApp,
        notificar2doPlano:resultUsuario.notificar2doPlano,
        notificarEmail:resultUsuario.notificarEmail,
        notificarSMS:resultUsuario.notificarSMS,
        notificarWS:resultUsuario.notificarWS
    }
    
    let authToken1 = util.generateJWTAuthToken(dataToken, config.jwt.tokenTime);

    const dataRenewToken = {
        username: resultUsuario.username,
        aT:authToken
    }

    const renewToken1= util.generateJWTAuthToken(dataRenewToken, config.jwt.renewTokenTime);

    dataToken.aT = authToken1;
    dataToken.rT = renewToken1;

    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null,  dataToken ));
});

exports.loginRazonSocial = loginRazonSocial;
  