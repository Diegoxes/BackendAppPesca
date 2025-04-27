'use strict';

const express = require('express');
const routes = express.Router();

var residuosSolidosController = require('../controller/residuos.solidos.mipesca.controller');

routes.get('/', residuosSolidosController.listResiduosSolidos);
routes.get('/descargarImagen/:id', residuosSolidosController.downloadImagen);
routes.get('/imagen/:id', residuosSolidosController.getResiduosSolidosImagen);
routes.get('/:id', residuosSolidosController.getResiduosSolidos);

module.exports = routes;