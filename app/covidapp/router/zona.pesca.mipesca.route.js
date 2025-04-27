'use strict';

const express = require('express');
const routes = express.Router();

var zonaPescaArmadorController = require('../controller/zona.pesca.mipesca.controller');

routes.get('/referencias', zonaPescaArmadorController.listReferencias);
routes.get('/zonas', zonaPescaArmadorController.listZonas);
routes.get('/calas', zonaPescaArmadorController.listCalas);

module.exports = routes;