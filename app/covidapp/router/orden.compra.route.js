'use strict';

const express = require('express');
const routes = express.Router();

var ordenCompraController = require('../controller/orden.compra.controller');

routes.get('/listByArmador', ordenCompraController.listOrdenCompraByArmador);

module.exports = routes;