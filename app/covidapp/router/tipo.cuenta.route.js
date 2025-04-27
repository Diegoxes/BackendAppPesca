'use strict';

const express = require('express');
const routes = express.Router();

var tipoCuentaController = require('../controller/tipo.cuenta.controller');

routes.get('/', tipoCuentaController.listTipoCuentas);

module.exports = routes;