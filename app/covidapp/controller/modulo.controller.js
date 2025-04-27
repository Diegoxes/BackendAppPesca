'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const moduloModel = require('../sequelize').Modulo;

var listModulos = awaitErrorHandlerFactory(async (req, res, next) => {
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var search = req.query.search;

    var where = null;
    if (search) {
        where = {
            [Op.or]: [
                { id: { [Op.like]: '%' + search + '%' } },
                { nombre: { [Op.like]: '%' + search + '%' } }
            ]
        };
    }

    var result = await moduloModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag,
        include: [
            { model: moduloModel, as: 'moduloPadre' },
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listModulos = listModulos;

var getModulo = awaitErrorHandlerFactory(async (req, res, next) => {
    var result = await moduloModel.findOne({
        where: {
            id: req.params.id
        },
        include: [
            { model: moduloModel, as: 'moduloPadre' },
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getModulo = getModulo;

var addModulo = awaitErrorHandlerFactory(async (req, res, next) => {
    var { id, nombre, padreId } = req.body;

    var data = {
        id,
        nombre,
        padreId
    };

    var result = await moduloModel.findOne({
        where: {
            id: id
        }
    });

    if (result === null) {
        var resultAdd = await moduloModel.create(data);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultAdd));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_DUPLICADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_DUPLICADO(`Ya existe un Modulo con el id = ${id}`), null));
});
exports.addModulo = addModulo;

var editModulo = awaitErrorHandlerFactory(async (req, res, next) => {
    var { nombre, padreId } = req.body;

    var data = {
        nombre,
        padreId
    };

    var result = await moduloModel.findOne({
        where: {
            id: req.params.id
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
exports.editModulo = editModulo;

var deleteModulo = awaitErrorHandlerFactory(async (req, res, next) => {
    var { id } = req.params;
    var arrIds = id.split(",");

    //Obtenemos los Ids finales a eliminar
    var result = await moduloModel.findAll({
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
            var resultDelete = await moduloModel.destroy({
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
exports.deleteModulo = deleteModulo;