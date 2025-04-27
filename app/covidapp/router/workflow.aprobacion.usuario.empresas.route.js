
'use strict';

const express = require('express');
const routes = express.Router();

const aprobacionUsuarioEmpresasController=require('../controller/aprobacion.usuarioEmpresas.controller')
const seguridadController=require('../controller/seguridad.controller')

routes.post('/', aprobacionUsuarioEmpresasController.createUsuarioEmpresas);
routes.get('/clasificar/usuarioEmpresas',aprobacionUsuarioEmpresasController.clasificarSolicitudesUsuarioEmpresas);
routes.get('/empresas/usuarioEmpresas',aprobacionUsuarioEmpresasController.getUsuarioEmpresasForUsername);
routes.post('/aprobar/usuarioEmpresas',aprobacionUsuarioEmpresasController.aprobarSolicitudUsuarioEmpresas);
routes.post('/rechazar/usuarioEmpresas',aprobacionUsuarioEmpresasController.rechazarSolicitudUsuarioEmpresas);
routes.get('/report/usuarioEmpresas',aprobacionUsuarioEmpresasController.getRequestForReport);
routes.get('/list/usuarioEmpresasAprobadas',aprobacionUsuarioEmpresasController.getRequestAprobadasList);
routes.post('/favorito/usuarioEmpresas',aprobacionUsuarioEmpresasController.updateFavoritoUser)
routes.post('/login/usuarioEmpresas',seguridadController.loginRazonSocial);
routes.post('rechazar/usuarioEmpresas',aprobacionUsuarioEmpresasController.rechazarSolicitudUsuarioEmpresas);
routes.get('/contar/usuarioEmpresas',aprobacionUsuarioEmpresasController.contarPendientesPorUsuario);


module.exports = routes;