'use strict';

const express = require('express');
const routes = express.Router();

var seguridadController = require('../controller/seguridad.controller');

//routes.post('/encryptPassword', seguridadController.encryptPassword);
//routes.post('/encryptTexto', seguridadController.encryptTexto);
//routes.post('/generateRandomBytes', seguridadController.generateRandomBytes);

routes.post('/login', seguridadController.loginUsuario);
routes.post('/sigin', seguridadController.addUsuario);
routes.post('/renew', seguridadController.renewToken);
routes.post('/registrarAcceso', seguridadController.addLogAcceso);
routes.post('/recoverPassword', seguridadController.recoverPassword);

routes.post('/existsEmail', seguridadController.existsEmail);

routes.get('/user', seguridadController.getDatosUsuario);
routes.put('/userUpdate', seguridadController.editDatosUsuario);
routes.put('/userUpdateNotifications', seguridadController.editNotificacionesUsuario);
routes.put('/passwordUpdate', seguridadController.editPasswordUsuario);

routes.post('/tokenEmbeddedApp', seguridadController.generateAccessTokenEmbeddedApp);
routes.post('/loginEmbeddedApp', seguridadController.loginEmbeddedApp);
routes.post('/registrarArmador', seguridadController.registrarArmador);

routes.get('/compliance', seguridadController.obtenerCompliance);
routes.post('/compliance', seguridadController.guardarCompliance);

routes.post('/userDelete', seguridadController.deleteUsuario)
routes.post('/solicitarDeleteAccount', seguridadController.solicitarDeleteAccount)


module.exports = routes;

return;