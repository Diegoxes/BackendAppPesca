'use strict';

const express = require('express');
const routes = express.Router();

var comunicadoController = require('../controller/comunicado.controller.js');

routes.get('/', comunicadoController.listComunicados);
routes.get('/porUsuario', comunicadoController.listComunicadosUsuario);
routes.get('/porUsuario/:id', comunicadoController.getComunicadosUsuario);
routes.get('/porUsuarioCount', comunicadoController.countComunicadosUsuario);
routes.get('/:id', comunicadoController.getComunicado);

routes.post('/uploadVideo', comunicadoController.uploadVideoComunicado);
routes.post('/uploadImagen', comunicadoController.uploadImagenComunicado);
routes.post('/uploadDocumento', comunicadoController.uploadDocumentoComunicado);

routes.post('/add', comunicadoController.addComunicado);
routes.put('/edit/:id', comunicadoController.editComunicado);
routes.delete('/delete/:id', comunicadoController.deleteComunicado);



module.exports = routes;