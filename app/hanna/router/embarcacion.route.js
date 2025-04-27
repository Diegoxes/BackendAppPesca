'use strict';

const express = require('express');
const routes = express.Router();

var embarcacionController = require('../controller/embarcacion.controller');

routes.get('', embarcacionController.list);
routes.get('/porArmador/:armador', embarcacionController.listPorArmador);
routes.get('/porArmador2', embarcacionController.listPorArmador2);
routes.get('/porArmadorRuc/:ruc', embarcacionController.listPorArmadorRuc);

module.exports = routes;
