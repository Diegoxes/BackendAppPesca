'use strict';

const express = require('express');
const routes = express.Router();

var informeFlotaController = require('../controller/informe.flota.controller');

routes.get('/porIF/:informeFlota', informeFlotaController.getXIF);

module.exports = routes;