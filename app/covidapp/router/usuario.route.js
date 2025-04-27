'use strict';

const express = require('express');
const routes = express.Router();

var usuarioController = require('../controller/usuario.controller');

routes.get('/', usuarioController.listUsuarios);
routes.get('/:username', usuarioController.getUsuario);
routes.post('/add', usuarioController.addUsuario);
routes.put('/edit/:username', usuarioController.editUsuario);
routes.put('/confirmarCuenta/:username', usuarioController.confirmarCuentaUsuario);
routes.delete('/delete/:username', usuarioController.deleteUsuario);
routes.post('/confirmar', usuarioController.confirmarUsuario);

module.exports = routes;