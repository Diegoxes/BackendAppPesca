'use strict';

const express = require('express');
const routes = express.Router();

var tipoCuentaModuloController = require('../controller/tipo.cuenta.modulo.controller');

routes.get('/', tipoCuentaModuloController.listTipoCuentaModulo);


module.exports = routes;