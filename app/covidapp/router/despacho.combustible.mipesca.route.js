'use strict';

const express = require('express');
const routes = express.Router();

var despachoCombustibleController = require('../controller/despacho.combustible.mipesca.controller');

routes.get('/', despachoCombustibleController.listDespachoCombustible);
routes.get('/imagen/:id', despachoCombustibleController.getDespachoCombustibleImagen);
routes.get('/descargarImagen/:id', despachoCombustibleController.downloadImagen);
routes.get('/video/:id', despachoCombustibleController.getVideo);
routes.get('/descargarVideo/:id', despachoCombustibleController.downloadVideo);
routes.get('/:id', despachoCombustibleController.getDespachoCombustible);

module.exports = routes;