'use strict';

const express = require('express');
const routes = express.Router();

var tolvaController = require('../controller/tolva.controller');

routes.get('/', tolvaController.listTolva);

module.exports = routes;