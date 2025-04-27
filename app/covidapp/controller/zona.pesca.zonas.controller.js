'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const zonaPescaZonasModel = require('../sequelize').ZonaPescaZonas;
const zonaPescaReferenciaModel = require('../sequelize').ZonaPescaReferencia;
const zonaPescaZonasReferenciaModel = require('../sequelize').ZonaPescaZonasReferencia;

const redisCovidapp = require("../../../db/connectionRedisCovidapp");

var listZonaPescaZonas = awaitErrorHandlerFactory(async (req, res, next) => {
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var where = {estado: true};
    var fecha = req.query.fecha;
    if (fecha && fecha != null && fecha != '') {
        where.fecha = {
            [Op.gte]: zonaPescaZonasModel.sequelize.literal("'" + fecha + " 00:00:00'"),
            [Op.lte]: zonaPescaZonasModel.sequelize.literal("'" + fecha + " 23:59:59'")
        }
    }

    var search = req.query.search;
    if (search) {
        where = {
            [Op.or]: [
                { id: { [Op.like]: '%' + search + '%' } },
                { nombre: { [Op.like]: '%' + search + '%' } },
            ]
        };
    }

    var attributes = [
        'id',
        [Sequelize.literal(`FORMAT (fecha, 'dd/MM/yyyy')`),'fecha'],
        'nombre',
        'lat',
        'latGMS',
        'lng',
        'lngGMS',
        'descripcion'
    ]

    var result = await zonaPescaZonasModel.findAndCountAll({
        attributes:attributes,
        where: where,
        offset: offSet,
        limit: regPag,
        include:[
            {
                model:zonaPescaZonasReferenciaModel,
                as:'zonaPescaZonasReferencia',
                include:[
                    {
                        model:zonaPescaReferenciaModel,
                        as:'zonaPescaReferencia'
                    }
                ]
            }
        ],
        order:[
            ['fecha', 'DESC']
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listZonaPescaZonas = listZonaPescaZonas;

var getZonaPescaZona = awaitErrorHandlerFactory(async (req, res, next) => {
    var attributes = [
        'id',
        [Sequelize.literal(`FORMAT (fecha, 'dd/MM/yyyy')`),'fecha'],
        'nombre',
        'lat',
        'latGMS',
        'lng',
        'lngGMS',
        'descripcion'
    ]

    var result = await zonaPescaZonasModel.findOne({
        attributes:attributes,
        where: {
            id: req.params.id,
            estado:true
        }
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getZonaPescaZona = getZonaPescaZona;

var addZonaPescaZona = awaitErrorHandlerFactory(async (req, res, next) => {
    var { fecha, nombre, latGMS, lngGMS, lat, lng , descripcion } = req.body;

    var data = {
        id: Sequelize.literal(`NEWID()`),
        fecha: Sequelize.literal(`'${fecha}'`),
        nombre,
        latGMS,
        lngGMS,
        lat,
        lng,
        descripcion,
        referencias:false
    };

    var resultAdd = await zonaPescaZonasModel.create(data);
    
    //Ejecutamos el SP para generar las referencias y sus distancias
    await  zonaPescaZonasModel.sequelize.query(`EXEC [dbo].[SP_GENERAR_ZONA_PESCA_ZONAS_REFERENCIAS]` );

    var keyRedis = `covidapp-zonaPescaZonasModel-listZonas-${fecha}`;
    await redisCovidapp.delKey(keyRedis);

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultAdd));
    return;
});
exports.addZonaPescaZona = addZonaPescaZona;

var editZonaPescaZona = awaitErrorHandlerFactory(async (req, res, next) => {
    var {fecha, nombre, latGMS, lngGMS, lat, lng , descripcion} = req.body;

    var data = {
        fecha: Sequelize.literal(`'${fecha}'`),
        nombre,
        latGMS,
        lngGMS,
        lat,
        lng,
        descripcion,
        referencias:false
    };

    var result = await zonaPescaZonasModel.findOne({
        where: {
            id: req.params.id
        }
    });

    if (result) {
        var resultUpdate = await result.update(data);

        //Ejecutamos el SP para generar las referencias y sus distancias
        await  zonaPescaZonasModel.sequelize.query(`EXEC [dbo].[SP_GENERAR_ZONA_PESCA_ZONAS_REFERENCIAS]` );

        var keyRedis = `covidapp-zonaPescaZonasModel-listZonas-${fecha}`;
        await redisCovidapp.delKey(keyRedis);

        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultUpdate));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.editZonaPescaZona = editZonaPescaZona;

var deleteZonaPescaZona = awaitErrorHandlerFactory(async (req, res, next) => {
    var { id } = req.params;
    var arrIds = id.split(",");

    var resultZonasPescaZonas = await zonaPescaZonasModel.findAll({
        where:{
            id:arrIds
        }
    });

    var resultDelete = await zonaPescaZonasModel.update({estado:false},{ where : { id : arrIds }});

    for(var i=0; i<resultZonasPescaZonas.length; i++){
        var zona = resultZonasPescaZonas[i];
        var keyRedis = `covidapp-zonaPescaZonasModel-listZonas-${zona.fecha}`;
        await redisCovidapp.delKey(keyRedis);
    }
    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultDelete));    
});
exports.deleteZonaPescaZona = deleteZonaPescaZona; 