'use strict';

const express = require('express');
const routes = express.Router();

var turnoDescargaController = require('../controller/turno.descarga.mipesca.controller');

routes.get('/obtenerXMatricula/:matricula',  turnoDescargaController.obtenerTurnoDescargaXMatricula);
routes.post('/generarSolicitudTurnoDescarga', turnoDescargaController.generarSolicitudTurnoDescarga);
routes.get('/obtenerSolicitudTurnoDescarga', turnoDescargaController.obtenerSolicitudTurnoDescarga);

module.exports = routes;
