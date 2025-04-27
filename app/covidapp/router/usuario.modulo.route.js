'use strict';

const express = require('express');
const routes = express.Router();

var usuarioModuloController = require('../controller/usuario.modulo.controller');

routes.get('/:username?/:moduloId?', usuarioModuloController.listUsuarioModulos);
routes.get('/get/:username/:moduloId', usuarioModuloController.getUsuarioModulo);
routes.post('/add', usuarioModuloController.addUsuarioModulo);
routes.put('/edit/:id', usuarioModuloController.editUsuarioModulo);
routes.delete('/delete/:id', usuarioModuloController.deleteUsuarioModulo);

module.exports = routes;