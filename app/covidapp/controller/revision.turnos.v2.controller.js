'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util                     = require('../../../util/util');
const constants                = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');

const Sequelize = require('sequelize');

const plantaModel = require('../sequelize').Planta;

var listDevices = awaitErrorHandlerFactory(async (req,res, next)=>{
    const devices = await plantaModel.sequelize.query(
        `
        SELECT DISTINCT tb1.deviceArmadorId, tb2.nombre, tb2.matricula, tb2.estado
        FROM [dbo].[device_armador_gps_historico] tb1
        JOIN [dbo].[device_armador] tb2 ON tb1.deviceArmadorId = tb2.id
        WHERE tb1.fecha BETWEEN '2023-10-01 00:00:00' AND '2024-01-31 23:59:59'    
        ORDER BY tb2.nombre ASC
    `, {
        type: Sequelize.QueryTypes.SELECT,
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, devices));
});
exports.listDevices = listDevices;

var listRoutes = awaitErrorHandlerFactory(async (req,res, next)=>{

    const viajes = await plantaModel.sequelize.query(
        `
        SELECT nroDescarga as nroViaje, COUNT(id) as nroTramasGPS
        FROM [dbo].[device_armador_gps_historico] tb1
        WHERE tb1.deviceArmadorId = '${req.params.armadorDeviceId}'
        AND tb1.fecha BETWEEN '2023-10-01 00:00:00' AND '2024-01-31 23:59:59'
        AND lat != 0 
        AND lat IS NOT NULL
        GROUP BY nroDescarga
        ORDER BY nroViaje ASC
    `, {
        type: Sequelize.QueryTypes.SELECT,
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, viajes));

});
exports.listRoutes = listRoutes;

var listRoutesPoints = awaitErrorHandlerFactory(async (req,res, next)=>{
    const viajePuntos = await plantaModel.sequelize.query(
        `
        SELECT 
            id, 
            ROW_NUMBER() OVER(ORDER BY id ASC) nroPosicion, 
            CAST(tb1.[fecha] AT TIME ZONE 'SA Pacific Standard Time' AS datetime) fecha,
            tb1.lat, tb1.lon, tb1.planta, tb1.rssi, tb1.bat
        FROM [dbo].[device_armador_gps_historico] tb1
        WHERE tb1.deviceArmadorId = '${req.params.armadorDeviceId}'
        AND tb1.fecha BETWEEN '2023-10-01 00:00:00' AND '2024-01-31 23:59:59'
        AND nroDescarga = ${req.params.nroDescarga}
        AND lat != 0 
        AND lat IS NOT NULL
        ORDER BY tb1.fecha ASC
    `, {
        type: Sequelize.QueryTypes.SELECT,
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, viajePuntos));
});
exports.listRoutesPoints = listRoutesPoints;