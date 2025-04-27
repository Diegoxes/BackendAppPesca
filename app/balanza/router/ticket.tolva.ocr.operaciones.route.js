'use strict';

const express = require('express');
const routes = express.Router();

var ticketTolvaOCRController = require('../controller/ticket.tolva.ocr.operaciones.controller');

routes.get('/', ticketTolvaOCRController.listTicketTolvaOCR);
routes.get('/:id', ticketTolvaOCRController.getTicketTolvaOCR);
routes.post('/add', ticketTolvaOCRController.addTicketTolvaOCR);
routes.put('/edit/:id', ticketTolvaOCRController.editTicketTolvaOCR);
routes.delete('/delete/:id', ticketTolvaOCRController.deleteTicketTolvaOCR);

module.exports = routes;
