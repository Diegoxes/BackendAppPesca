'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const usuarioModuloModel = require('../sequelize').UsuarioModulo;

var listUsuarioModulos = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username, moduloId } = req.params;
    var where = {};
    if (username && username != '*') where['username'] = username;
    if (moduloId) where['moduloId'] = moduloId;

    var result = await usuarioModuloModel.findAndCountAll({
        where: where
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listUsuarioModulos = listUsuarioModulos;

var getUsuarioModulo = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username, moduloId } = req.params;
    var result = await usuarioModuloModel.findOne({
        where: {
            username: username,
            moduloId: moduloId
        }
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getUsuarioModulo = getUsuarioModulo;

var addUsuarioModulo = awaitErrorHandlerFactory(async (req, res, next) => {
    var { username, moduloId} = req.body;
    
    var result = await usuarioModuloModel.destroy({
        where: {
            username: username
        }
    });

    if(moduloId != null && moduloId != ''){
        let arrModulo = moduloId.split(",");
        arrModulo.forEach(async moduloId => {
            var data = {
                username,
                moduloId
            };
            //Validamos si el nombre de planta ya esta registrado
            await usuarioModuloModel.create(data);
        });
    }
    
    
    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
});
exports.addUsuarioModulo = addUsuarioModulo;

var editUsuarioModulo = awaitErrorHandlerFactory(async (req, res, next) => {
    var { id } = req.params;
    var { username, moduloId } = req.body;

    var data = {
        username,
        moduloId
    };

    var result = await usuarioModuloModel.findOne({
        where: {
            id: id
        }
    });

    if (result) {
        var resultUpdate = await result.update(data);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultUpdate));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
});
exports.editUsuarioModulo = editUsuarioModulo;

var deleteUsuarioModulo = awaitErrorHandlerFactory(async (req, res, next) => {
    var { id } = req.params;
    var arrIds = id.split(",");

    //Obtenemos los Ids finales a eliminar
    var result = await usuarioModuloModel.findAll({
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
            var resultDelete = await usuarioModuloModel.destroy({
                where: {
                    id: arrIdsFinal
                }
            });
            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultDelete));
        } else {
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
        }
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
});
exports.deleteUsuarioModulo = deleteUsuarioModulo;