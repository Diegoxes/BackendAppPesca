'use strict';

const express = require('express');
const routes = express.Router();

var revisionTurnosV2Controller = require('../controller/revision.turnos.v2.controller');

routes.get('/devices/', revisionTurnosV2Controller.listDevices);
routes.get('/routes/:armadorDeviceId', revisionTurnosV2Controller.listRoutes);
routes.get('/routes/points/:armadorDeviceId/:nroDescarga', revisionTurnosV2Controller.listRoutesPoints);



module.exports = routes;