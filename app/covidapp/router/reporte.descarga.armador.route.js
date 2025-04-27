'use strict';

const express = require('express');
const routes = express.Router();

var reporteDescargaArmadorController = require('../controller/reporte.descarga.armador.controller');

routes.get('/listDescargas', reporteDescargaArmadorController.listDescargas);

module.exports = routes;