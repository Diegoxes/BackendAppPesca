'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const turnoPlantaGeocercaModel = require('../sequelize').TurnoPlantaGeocerca;
const plantaModel = require('../sequelize').Planta;

var listTurnoPlantaGeocercas = awaitErrorHandlerFactory(async (req, res, next) => {
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var attributes = [
        'id',
        'plantaId',
        'nombre',
        [Sequelize.literal('dbo.geometry2json([geom])'),'geom'],
        'estado',
        'createdAt',
        'updatedAt'
    ];

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

    var result = await turnoPlantaGeocercaModel.findAndCountAll({
        attributes:attributes,
        where: where,
        offset: offSet,
        limit: regPag,
        include: [
            { model: plantaModel, as: 'planta' },
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listTurnoPlantaGeocercas = listTurnoPlantaGeocercas;

var getTurnoPlantaGeocerca = awaitErrorHandlerFactory(async (req, res, next) => {
    var attributes = [
        'id',
        'plantaId',
        'nombre',
        [Sequelize.literal('dbo.geometry2json([geom])'),'geom'],
        'estado',
        'createdAt',
        'updatedAt'
    ];

    var result = await turnoPlantaGeocercaModel.findOne({
        attributes:attributes,
        where: {
            id: req.params.id
        }
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getTurnoPlantaGeocerca = getTurnoPlantaGeocerca;

var addTurnoPlantaGeocerca = awaitErrorHandlerFactory(async (req, res, next) => {
    var { plantaId, nombre, geom , estado} = req.body;

    var geomLiteral = Sequelize.literal(`geometry::STGeomFromText('${geom}', 3857)`);
    var data = {
        id: Sequelize.literal(`NEWID()`),
        plantaId,
        nombre,
        geom:geomLiteral,
        estado
    };

    var resultAdd = await turnoPlantaGeocercaModel.create(data);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultAdd));
    return;
});
exports.addTurnoPlantaGeocerca = addTurnoPlantaGeocerca;

var editTurnoPlantaGeocerca = awaitErrorHandlerFactory(async (req, res, next) => {
    var { plantaId, nombre, geom, estado} = req.body;

    var data = {
        plantaId,
        nombre,
        estado
    };

    if(geom != null && geom != ''){
        data.geom = Sequelize.literal(`geometry::STGeomFromText('${geom}', 3857)`);
    }

    var result = await turnoPlantaGeocercaModel.findOne({
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
exports.editTurnoPlantaGeocerca = editTurnoPlantaGeocerca;

var deleteTurnoPlantaGeocerca = awaitErrorHandlerFactory(async (req, res, next) => {
    var { id } = req.params;
    var arrIds = id.split(",");
    var resultDelete = await turnoPlantaGeocercaModel.destroy({ where : { id : arrIds }});
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultDelete));    
});
exports.deleteTurnoPlantaGeocerca = deleteTurnoPlantaGeocerca;