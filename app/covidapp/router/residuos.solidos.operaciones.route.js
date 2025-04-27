'use strict';

const express = require('express');
const routes = express.Router();

var residuosSolidosController = require('../controller/residuos.solidos.operaciones.controller');

routes.get('/', residuosSolidosController.listResiduosSolidos);
routes.get('/imagen/:id', residuosSolidosController.getResiduosSolidosImagen);
routes.get('/descargarImagen/:id', residuosSolidosController.downloadImagen);
routes.get('/:id', residuosSolidosController.getResiduosSolidos);
routes.post('/add', residuosSolidosController.addResiduosSolidos);
routes.put('/edit/:id', residuosSolidosController.editResiduosSolidos);

routes.delete('/delete/:id', residuosSolidosController.deleteResiduosSolidos);
routes.delete('/deleteImagen/:id', residuosSolidosController.deleteImagenResiduosSolidos);

module.exports = routes;