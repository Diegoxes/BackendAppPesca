'use strict';

const express = require('express');
const routes = express.Router();

var adelantoController = require('../controller/adelanto.controller');

routes.get('/adelantosEmbarcacion', adelantoController.listarAdelantosEmbarcacion);
routes.get('/adelantosEmbarcacionDetalle', adelantoController.listarAdelantosEmbarcacionDetalle);
routes.get('/adelantosDetallePago', adelantoController.listarAdelantoDetallePagos);
routes.get('/adelantosEmbarcacionDescuentos', adelantoController.listarAdelantoDescuentos);
routes.get('/adelantosEmbarcacionDescuentosDetalle', adelantoController.listarAdelantoDescuentoDetalle);


routes.get('/adelantosSolicitudes', adelantoController.listarAdelantoSolictudes);
routes.post('/adelantosSolicitudes', adelantoController.registrarAdelantoSolictud);
routes.put('/adelantosSolicitudes/:adelantoId', adelantoController.editarAdelantoSolictud);
routes.delete('/adelantosSolicitudes/:adelantoId', adelantoController.eliminarAdelantoSolictud);

module.exports = routes;