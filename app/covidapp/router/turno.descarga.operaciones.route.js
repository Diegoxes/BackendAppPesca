'use strict';

const express = require('express');
const routes = express.Router();

var turnoDescargaController = require('../controller/turno.descarga.operaciones.controller');

routes.get('/obtenerXPlantaFecha/:planta/:fecha', turnoDescargaController.obtenerTurnoDescargaXPlanta);

module.exports = routes;
