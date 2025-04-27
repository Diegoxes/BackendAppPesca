'use strict';

const express = require('express');
const routes = express.Router();

var descargaMpController = require('../controller/descarga.mp.operaciones.controller');

routes.get('/', descargaMpController.listDescargaMp);
routes.get('/imagen/:id', descargaMpController.getDescargaMpImagen);
routes.get('/descargarImagen/:id', descargaMpController.downloadImagen);
routes.get('/video/:id', descargaMpController.getVideo);
routes.get('/descargarVideo/:id', descargaMpController.downloadVideo);
routes.get('/getIF', descargaMpController.getInformeFlota);
routes.get('/:id', descargaMpController.getDescargaMp);
routes.post('/add', descargaMpController.addDescargaMp);
routes.put('/edit/:id', descargaMpController.editDescargaMp);
routes.post('/uploadVideo', descargaMpController.uploadVideo1);
routes.post('/uploadVideo1', descargaMpController.uploadVideo1);
routes.post('/uploadVideo2', descargaMpController.uploadVideo2);
routes.post('/uploadVideo3', descargaMpController.uploadVideo3);
routes.post('/renewStream/:id', descargaMpController.renewStreamLinks);

routes.delete('/delete/:id', descargaMpController.deleteDescargaMp);
routes.delete('/deleteVideo/:id', descargaMpController.deleteVideoDescargaMp);
routes.delete('/deleteImagen/:id', descargaMpController.deleteImagenDescargaMp);

routes.post('/uploadDocumento', descargaMpController.uploadDocumento);

module.exports = routes;