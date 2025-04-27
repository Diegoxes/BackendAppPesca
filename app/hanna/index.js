'use strict';

const logger = require('../../util/basic-logger');

var initRoutes = async (app) => {
    try{
        const embarcacionRoute = require('./router/embarcacion.route');
        app.use('/covidapp/general/embarcacion/', embarcacionRoute);

        const armadorRoute = require('./router/armador.route');
        app.use('/covidapp/general/armador/', armadorRoute);

        const informeFlotaRoute = require('./router/informe.flota.route');
        app.use('/covidapp/general/if/', informeFlotaRoute);

        const temporadaRoute = require('./router/temporada.route');
        app.use('/covidapp/general/temporada/', temporadaRoute);

    }catch(err){
        logger.error(err);
    }
};

exports.initRoutes = initRoutes;
