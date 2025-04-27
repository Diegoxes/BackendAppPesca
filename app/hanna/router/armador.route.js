'use strict';

const express = require('express');
const routes = express.Router();

var armadorController = require('../controller/armador.controller');

routes.get('/', armadorController.list);
routes.get('/:armador', armadorController.get);
module.exports = routes;