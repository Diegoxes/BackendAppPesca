'use strict';

const express = require('express');
const routes = express.Router();

var zonaPescaZonasController = require('../controller/zona.pesca.zonas.controller');

routes.get('/', zonaPescaZonasController.listZonaPescaZonas);
routes.get('/:id', zonaPescaZonasController.getZonaPescaZona);
routes.post('/add', zonaPescaZonasController.addZonaPescaZona);
routes.put('/edit/:id', zonaPescaZonasController.editZonaPescaZona);
routes.delete('/delete/:id', zonaPescaZonasController.deleteZonaPescaZona);

module.exports = routes;