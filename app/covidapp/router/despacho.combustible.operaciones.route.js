'use strict';

const express = require('express');
const routes = express.Router();

var despachoCombustibleController = require('../controller/despacho.combustible.operaciones.controller');

routes.get('/', despachoCombustibleController.listDespachoCombustible);
routes.get('/imagen/:id', despachoCombustibleController.getDespachoCombustibleImagen);
routes.get('/descargarImagen/:id', despachoCombustibleController.downloadImagen);
routes.get('/video/:id', despachoCombustibleController.getVideo);
routes.get('/descargarVideo/:id', despachoCombustibleController.downloadVideo);
routes.get('/:id', despachoCombustibleController.getDespachoCombustible);
routes.post('/add', despachoCombustibleController.addDespachoCombustible);
routes.put('/edit/:id', despachoCombustibleController.editDespachoCombustible);
routes.post('/uploadVideo', despachoCombustibleController.uploadVideo1);
routes.post('/uploadVideo1', despachoCombustibleController.uploadVideo1);
routes.post('/uploadVideo2', despachoCombustibleController.uploadVideo2);
routes.post('/uploadVideo3', despachoCombustibleController.uploadVideo3);

routes.delete('/delete/:id', despachoCombustibleController.deleteDespachoCombustible);
routes.delete('/deleteVideo/:id', despachoCombustibleController.deleteVideoDespachoCombustible);
routes.delete('/deleteImagen/:id', despachoCombustibleController.deleteImagenDespachoCombustible);


module.exports = routes;