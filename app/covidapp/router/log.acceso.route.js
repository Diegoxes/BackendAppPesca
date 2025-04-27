'use strict';

const express = require('express');
const routes = express.Router();

var logAccesoController = require('../controller/log.acceso.controller');

routes.get('/', logAccesoController.listLogAccesos);

module.exports = routes;