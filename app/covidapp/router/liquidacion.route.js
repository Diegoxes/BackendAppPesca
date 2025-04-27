'use strict';

const express = require('express');
const routes = express.Router();

var liquidacionController = require('../controller/liquidacion.controller');

routes.get('/', liquidacionController.listarLiquidaciones);
routes.get('/detalleLiquidacion/:id', liquidacionController.detalleLiquidacion);
routes.get('/descargarLiquidacion/:ruc/:id', liquidacionController.descargarLiquidacion);
routes.get('/descargarLiquidacionDescuentoFep/:ruc/:id/:ejercicio', liquidacionController.descargarLiquidacionDescuentoFep);
routes.get('/descargarFactura/:folio', liquidacionController.descargarFactura);

module.exports = routes;