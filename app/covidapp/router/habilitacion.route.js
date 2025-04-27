'use strict';

const express = require('express');
const routes = express.Router();

var habilitacionController = require('../controller/habilitacion.controller');

routes.get('/habilitacionesEmbarcacion', habilitacionController.listarHabilitacionesEmbarcacion);
routes.get('/habilitacionesEmbarcacionDetalle', habilitacionController.listarHabilitacionesEmbarcacionDetalle);
routes.get('/habilitacionesDetallePago', habilitacionController.listarHabilitacionDetallePagos);

routes.get('/habilitacionesSolicitudes', habilitacionController.listarHabilitacionSolictudes);
routes.post('/habilitacionesSolicitudes', habilitacionController.registrarHabilitacionSolictud);
routes.put('/habilitacionesSolicitudes/:habilitacionId', habilitacionController.editarHabilitacionSolictud);
routes.delete('/habilitacionesSolicitudes/:habilitacionId', habilitacionController.eliminarHabilitacionSolictud);


module.exports = routes;