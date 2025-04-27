'use strict';

const express = require('express');
const routes = express.Router();

var descargaMpController = require('../controller/descarga.mp.mipesca.controller');

routes.get('/', descargaMpController.listDescargaMp);
routes.get('/imagen/:id', descargaMpController.getDescargaMpImagen);
routes.get('/descargarImagen/:id', descargaMpController.downloadImagen);
routes.get('/video/:id', descargaMpController.getVideo);
routes.get('/descargarVideo/:id', descargaMpController.downloadVideo);
routes.get('/:id', descargaMpController.getDescargaMp);


module.exports = routes;