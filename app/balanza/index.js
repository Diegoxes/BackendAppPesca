'use strict';

const logger = require('../../util/basic-logger');

var initRoutes = async (app) => {
    try{

        const covidappTicketTolvaOCROperacionesRoute = require('./router/ticket.tolva.ocr.operaciones.route');
        app.use('/covidapp/tolva/ticket', covidappTicketTolvaOCROperacionesRoute);

    }catch(err){
        logger.error(err);
    }
};

exports.initRoutes = initRoutes;
