'use strict';

const express = require('express');
const routes = express.Router();

var genericosSapController = require('../controller/genericos.odata.controller');

routes.get('/datosArmador', genericosSapController.obtenerDatosArmador);
routes.get('/cuentasArmador', genericosSapController.obtenerCuentasArmador);
routes.get('/tipoViaPagoArmador', genericosSapController.listarTipoViaPagoArmador);
routes.get('/embarcacionesArmador', genericosSapController.listarEmbarcacionesArmador);

routes.get('/parametros', genericosSapController.listarParametros);
routes.get('/temporada', genericosSapController.listarTemporada);
routes.get('/tipoMoneda', genericosSapController.listarTipoMoneda);
routes.get('/tipoPlanta', genericosSapController.listarTipoPlanta);


module.exports = routes;