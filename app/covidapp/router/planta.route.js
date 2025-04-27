'use strict';

const express = require('express');
const routes = express.Router();

var plantaController = require('../controller/planta.controller');

routes.get('/', plantaController.listPlanta);
routes.get('/:id', plantaController.obtenerPlanta);

module.exports = routes;