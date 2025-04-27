'use strict';

const express = require('express');
const routes = express.Router();

var chataController = require('../controller/chata.controller');

routes.get('/', chataController.listChata);

module.exports = routes;