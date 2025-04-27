'use strict';

const express = require('express');
const routes = express.Router();

var temporadaController = require('../controller/temporada.controller');

routes.get('/', temporadaController.list);
module.exports = routes;