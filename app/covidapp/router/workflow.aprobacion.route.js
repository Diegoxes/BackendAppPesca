
'use strict';

const express = require('express');
const routes = express.Router();

var workflowAprobacionController = require('../controller/workflow.aprobacion.controller');
routes.get('/', workflowAprobacionController.listWorflowAprobacionAH);
routes.get('/:id', workflowAprobacionController.getWorkflowAprobacion);
routes.get('/consulta/count',workflowAprobacionController.countRequestForUser)
routes.get('/verify/desicion',workflowAprobacionController.verifyDecision);
routes.post('/habilitacion/aprobar',workflowAprobacionController.aprobarSolicitudHabilitacion);
routes.post('/habilitacion/rechazar',workflowAprobacionController.rechazarSolicitudHabilitacion);
routes.post('/adelanto/aprobar',workflowAprobacionController.aprobarSolicitudAdelanto);
routes.post('/adelanto/rechazar',workflowAprobacionController.rechazarSolicitudAdelanto);
routes.get('/listar/temporadas',workflowAprobacionController.obtenerClavesPrimariasTemporada);
// routes.get('/reporte/solicitudesAH',workflowAprobacionController.reporteWorflowAprobacionAH);
routes.get('/reporte/solicitudes',workflowAprobacionController.obtenerSolicitudesFiltradas);
routes.get('/obtener/typeTemplate',workflowAprobacionController.obtenerTemplates)
routes.get('/clasificar/solicitudes',workflowAprobacionController.clasificarSolicitudes)

routes.get('/bandeja/pendientes',workflowAprobacionController.getBandejaPendientes)
routes.get('/bandeja/aprobadas',workflowAprobacionController.getBandejaAprobadas)
routes.get('/bandeja/rechazadas',workflowAprobacionController.getBandejaRechazadas)
routes.get('/bandeja/solicitudesFiltradas',workflowAprobacionController.getBandejadeSolicitudesFiltradas)


/*
routes.post('/add', workflowAprobacionController.addWorkflowAprobacion);
routes.put('/edit/:id', workflowAprobacionController.editWorkflowAprobacion);
routes.delete('/delete/:id', workflowAprobacionController.deleteWorkflowAprobacion);
routes.get('/aprobador/', workflowAprobacionController.listWorkflowAprobacionAprobadores);
routes.get('/aprobador/:id', workflowAprobacionController.getWorkflowAprobacionAprobador);
routes.post('/aprobador/add', workflowAprobacionController.addWorkflowAprobacionAprobador);
routes.put('/aprobador/edit/:id', workflowAprobacionController.editWorkflowAprobacionAprobador);
routes.delete('/aprobador/delete/:id', workflowAprobacionController.deleteWorkflowAprobacionAprobador);
*/
module.exports = routes;