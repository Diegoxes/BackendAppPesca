'use strict';

const logger = require('../../util/basic-logger');

var initRoutes = async (app) => {
    try{
        const covidappTipoDocumentoRoute = require('./router/tipo.documento.route');
        app.use('/covidapp/general/tipoDocumento/', covidappTipoDocumentoRoute);

        const covidappTipoCuentaRoute = require('./router/tipo.cuenta.route');
        app.use('/covidapp/general/tipoCuenta/', covidappTipoCuentaRoute);

        const covidappTipoCuentaModulo= require('./router/tipo.cuenta.modulo.route');
        app.use('/covidapp/general/tipoCuentaModulo/', covidappTipoCuentaModulo);

        const covidappPlantaRoute = require('./router/planta.route');
        app.use('/covidapp/general/planta/', covidappPlantaRoute);

        const covidappChataRoute = require('./router/chata.route');
        app.use('/covidapp/general/chata/', covidappChataRoute);

        const covidappTolvaRoute = require('./router/tolva.route');
        app.use('/covidapp/general/tolva/', covidappTolvaRoute);

        const covidappSeguridadRoute = require('./router/seguridad.route');
        app.use('/covidapp/seguridad/', covidappSeguridadRoute);

        const covidappUsuarioRoute = require('./router/usuario.route');
        app.use('/covidapp/administrador/usuario/', covidappUsuarioRoute);

        const covidappModuloRoute = require('./router/modulo.route');
        app.use('/covidapp/administrador/modulo/', covidappModuloRoute);
        
        const covidappUsuarioModuloRoute = require('./router/usuario.modulo.route');
        app.use('/covidapp/administrador/usuario/modulo/', covidappUsuarioModuloRoute);

        const covidappDescargaMpOperacionesRoute = require('./router/descarga.mp.operaciones.route');
        app.use('/covidapp/operaciones/descargamp/', covidappDescargaMpOperacionesRoute);

        const covidappDespachoCombustibleOperacionesRoute = require('./router/despacho.combustible.operaciones.route');
        app.use('/covidapp/operaciones/despachoCombustible/', covidappDespachoCombustibleOperacionesRoute);

        const covidappResiduosSolidosOperacionesRoute = require('./router/residuos.solidos.operaciones.route');
        app.use('/covidapp/operaciones/residuosSolidos/', covidappResiduosSolidosOperacionesRoute);

        const covidappDescargaMpMipescaRoute = require('./router/descarga.mp.mipesca.route');
        app.use('/covidapp/mipesca/descargamp/', covidappDescargaMpMipescaRoute);

        const covidappDespachoCombustibleMipescaRoute = require('./router/despacho.combustible.mipesca.route');
        app.use('/covidapp/mipesca/despachoCombustible/', covidappDespachoCombustibleMipescaRoute);

        const covidappResiduosSolidosMipescaRoute = require('./router/residuos.solidos.mipesca.route');
        app.use('/covidapp/mipesca/residuosSolidos/', covidappResiduosSolidosMipescaRoute);

        const covidappTurnoDescargaMipescaRoute = require('./router/turno.descarga.mipesca.route');
        app.use('/covidapp/mipesca/turnoDescarga/', covidappTurnoDescargaMipescaRoute);

        const covidappReporteResiduosSolidosRoute = require('./router/reporte.residuos.solidos.controller');
        app.use('/covidapp/reporte/residuosSolidos/', covidappReporteResiduosSolidosRoute);

        const covidappTurnoDescargaOperacionesRoute = require('./router/turno.descarga.operaciones.route');
        app.use('/covidapp/operaciones/turnoDescarga/', covidappTurnoDescargaOperacionesRoute);

        const covidappTurnoPlantaGeocercaRoute = require('./router/turno.planta.geocerca.route');
        app.use('/covidapp/administrador/turnoPlantaGeocerca/', covidappTurnoPlantaGeocercaRoute);

        const covidappZonaPescaZonasRoute = require('./router/zona.pesca.zonas.route');
        app.use('/covidapp/administrador/zonaPesca/zonas/', covidappZonaPescaZonasRoute);

        const covidappZonaPescaMiPescaRoute = require('./router/zona.pesca.mipesca.route');
        app.use('/covidapp/mipesca/zonaPesca/', covidappZonaPescaMiPescaRoute);

        const covidappOrdenCompraRoute = require('./router/orden.compra.route');
        app.use('/covidapp/ordenCompra/', covidappOrdenCompraRoute);

        const covidappLiquidacion = require('./router/liquidacion.route');
        app.use('/covidapp/liquidacion/', covidappLiquidacion);

        const covidappAdelanto = require('./router/adelanto.route');
        app.use('/covidapp/adelanto/', covidappAdelanto);

        const covidappHabilitacion = require('./router/habilitacion.route');
        app.use('/covidapp/habilitacion/', covidappHabilitacion);

        const covidappGenericosOdata = require('./router/genericos.odata.routes');
        app.use('/covidapp/odata/', covidappGenericosOdata);

        const covidappComunicado = require('./router/comunicado.route');
        app.use('/covidapp/comunicado/', covidappComunicado);

        const covidappReporteDescargaArmador = require('./router/reporte.descarga.armador.route');
        app.use('/covidapp/reporte/descargaArmador', covidappReporteDescargaArmador);

        const covidappRevisionTurnosV2 = require('./router/revision.turnos.v2.route');
        app.use('/covidapp/turnosv2/revisionTurnosV2', covidappRevisionTurnosV2);

        const covidappWorkflowTemplate= require('./router/workflow.template.route');
        app.use('/covidapp/administrador/workflowTemplate/', covidappWorkflowTemplate);

        const covidappWorflowAprobacion=require('./router/workflow.aprobacion.route')
        app.use('/covidapp/workflowAprobacion',covidappWorflowAprobacion)

        const covidappWorflowAprobacionUsuarioEmpresas=require('./router/workflow.aprobacion.usuario.empresas.route')
        app.use('/covidapp/workflowAprobacionUsuarioEmpresas',covidappWorflowAprobacionUsuarioEmpresas)

    }catch(err){
        logger.error(err);
    }
};

exports.initRoutes = initRoutes;
