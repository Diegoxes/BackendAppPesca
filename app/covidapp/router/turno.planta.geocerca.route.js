'use strict';

const express = require('express');
const routes = express.Router();

var turnoPlantaGeocercaController = require('../controller/turno.planta.geocerca.controller');

routes.get('/', turnoPlantaGeocercaController.listTurnoPlantaGeocercas);
routes.get('/:id', turnoPlantaGeocercaController.getTurnoPlantaGeocerca);
routes.post('/add', turnoPlantaGeocercaController.addTurnoPlantaGeocerca);
routes.put('/edit/:id', turnoPlantaGeocercaController.editTurnoPlantaGeocerca);
routes.delete('/delete/:id', turnoPlantaGeocercaController.deleteTurnoPlantaGeocerca);

module.exports = routes;