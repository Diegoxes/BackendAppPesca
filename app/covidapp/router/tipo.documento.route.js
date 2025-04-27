'use strict';

const express = require('express');
const routes = express.Router();

var tipoDocumentoController = require('../controller/tipo.documento.controller');

routes.get('/', tipoDocumentoController.listTipoDocumentos);

module.exports = routes;