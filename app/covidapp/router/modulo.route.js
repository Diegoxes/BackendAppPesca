'use strict';

const express = require('express');
const routes = express.Router();

var moduloController = require('../controller/modulo.controller');

routes.get('/', moduloController.listModulos);
routes.get('/:id', moduloController.getModulo);
routes.post('/add', moduloController.addModulo);
routes.put('/edit/:id', moduloController.editModulo);
routes.delete('/delete/:id', moduloController.deleteModulo);

module.exports = routes;