'use strict';

const express = require('express');
const routes = express.Router();

var reporteResiduosSolidosController = require('../controller/reporte.residuos.solidos.controller');

routes.get('/listResiduosSolidosActas', reporteResiduosSolidosController.listResiduosSolidosActas);

module.exports = routes;