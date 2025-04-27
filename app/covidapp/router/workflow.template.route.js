
'use strict';

const express = require('express');
const routes = express.Router();

var workflowTemplateController = require('../controller/workflow.template.controller');

routes.get('/', workflowTemplateController.listWorkflowTemplates);
routes.get('/:id', workflowTemplateController.getWorkflowTemplate);
routes.post('/add', workflowTemplateController.addWorkflowTemplate);
routes.put('/edit/:id', workflowTemplateController.editWorkflowTemplate);
routes.delete('/delete/:id', workflowTemplateController.deleteWorkflowTemplate);

routes.get('/aprobador/:workflowTemplateId', workflowTemplateController.listWorkflowTemplateAprobadores);
routes.get('/aprobador/:workflowTemplateId/get/:id', workflowTemplateController.getWorkflowTemplateAprobador);
routes.post('/aprobador/:workflowTemplateId/add', workflowTemplateController.addWorkflowTemplateAprobador);
routes.put('/aprobador/:workflowTemplateId/edit/:id', workflowTemplateController.editWorkflowTemplateAprobador);
routes.delete('/aprobador/:workflowTemplateId/delete/:id', workflowTemplateController.deleteWorkflowTemplateAprobador);

module.exports = routes;