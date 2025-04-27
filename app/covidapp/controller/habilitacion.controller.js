'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util                     = require('../../../util/util');
const constants                = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');
const moment = require('moment');

const seguridadController = require("./seguridad.controller");

const wsZSCP_ARMADORES_SRV = require('../sap_odata/ZSCP_ARMADORES_SRV');
const wsZFISV_ARM_SRV_SRV = require('../sap_odata/ZFISV_ARM_SRV_SRV');
const { searchApproverOne, crearRegistroAprobacionAprobador, crearRegistroSapId, sendApprovalEmail,sendAllEmailHaydukUsers,findUser} = require('./workflow.aprobacion.controller');
const { crearWorkFlowAprobacion } = require('./workflow.template.controller');
const utilWorkflowAprobacion=require('../../../util/utilWorkflowAprobacion')

const uuidv4 = require('uuid').v4;

var listarHabilitacionesEmbarcacion = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-habilitaciones'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var dataReturn = {
        rows:[],
        count:0
    };
    var result = await wsZSCP_ARMADORES_SRV.getHabilitacionesEmbarcaciones(resultToken.rucEmpresa);
    if(result){
        if(!Array.isArray(result) && typeof result === 'object')
            result = [result];

        dataReturn.rows = result.map((value)=>{
            var dataLiq = value.content['m:properties'];

            return dataLiq;
        });
        dataReturn.count = dataReturn.rows.length;
    }
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataReturn));

});
exports.listarHabilitacionesEmbarcacion = listarHabilitacionesEmbarcacion;

var listarHabilitacionesEmbarcacionDetalle = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-habilitaciones'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var embarcacion = req.query.embarcacion;
    var fechaInicio = req.query.fechaInicio;
    var fechaFin = req.query.fechaFin;
    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getDetalleHabilitacionesEmbarcacion(resultToken.rucEmpresa, embarcacion, fechaInicio, fechaFin);
    if(result){
        if(!Array.isArray(result) && typeof result === 'object')
            result = [result];

        dataReturn.rows = result.map((value)=>{
            var dataLiq = value.content['m:properties'];

            return dataLiq;
        });
        
        dataReturn.count = dataReturn.rows.length;

    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataReturn));
});
exports.listarHabilitacionesEmbarcacionDetalle = listarHabilitacionesEmbarcacionDetalle;

var listarHabilitacionDetallePagos = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-habilitaciones'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var habilitacionId = req.query.habilitacionId;
    var ejercicio = req.query.ejercicio;
    var posicion = req.query.posicion;
    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getDetalleHabilitacionesPagos(resultToken.rucEmpresa, habilitacionId, ejercicio, posicion);
    if(result){
        if(!Array.isArray(result) && typeof result === 'object')
            result = [result];

        dataReturn.rows = result.map((value)=>{
            var dataLiq = value.content['m:properties'];

            return dataLiq;
        });
        
        dataReturn.count = dataReturn.rows.length;

    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataReturn));
});
exports.listarHabilitacionDetallePagos = listarHabilitacionDetallePagos;


var listarHabilitacionSolictudes = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-habilitaciones'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZFISV_ARM_SRV_SRV.getSolicitudesPendientesHabilitaciones(resultToken.rucEmpresa);
    if(result){
        if(!Array.isArray(result) && typeof result === 'object')
            result = [result];

        dataReturn.rows = result.map((value)=>{
            var dataLiq = value.content['m:properties'];

            return dataLiq;
        });
        
        dataReturn.count = dataReturn.rows.length;

    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataReturn));
    return;
});
exports.listarHabilitacionSolictudes = listarHabilitacionSolictudes;



var registrarHabilitacionSolictud = awaitErrorHandlerFactory(async (req,res, next)=>{

    var arrModulosIds= ['covidapp-habilitaciones'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    const usernameMail=resultToken.username

    var { montoSolicitud, planta, viaPago, embarcacion, detalle } = req.body;

    /*
    CAMBIO 29/10/2024
    Se cambio a obtener los datos de la embarcacion por el metodo getHabilitacionesEmbarcaciones 
    porque el metodo getHabilitacionEmbarcacion retorna como valores de monto disponible 0 cuando si se tiene disponible... 
    revisar en algun momento con el equipo de SAP
    */

    var resultHabilitacionEmbarcaciones = await wsZSCP_ARMADORES_SRV.getHabilitacionesEmbarcaciones(resultToken.rucEmpresa);

    var resultHabilitacionEmbarcacion = null;
    if(typeof resultHabilitacionEmbarcaciones == 'object'){
        var rowContent = resultHabilitacionEmbarcaciones.content;
        var rowProperties = rowContent['m:properties']
        resultHabilitacionEmbarcacion = rowProperties;
    }else{
        var resultHabilitacionEmbarcacionFilter = resultHabilitacionEmbarcaciones.filter((row)=>{
            var rowContent = row.content;
            var rowProperties = rowContent['m:properties']
            return rowProperties['d:Embarcacion'] == embarcacion;
        });
       
        if(resultHabilitacionEmbarcacionFilter.length == 1){
            resultHabilitacionEmbarcacion = resultHabilitacionEmbarcacionFilter[0].content['m:properties']
        }
    }

    if(resultHabilitacionEmbarcacion){
        var montoDisponible = resultHabilitacionEmbarcacion['d:MontoDisponible'];
        var montoConsumidoFinal = montoDisponible - montoSolicitud;
        if(resultHabilitacionEmbarcacion['d:MontoDisponible'] <= 0){
             var msj = `La embarcación ${resultHabilitacionEmbarcacion['d:Descripcion']} no cuenta con linea de crédito para solicitar la habilitación.`
             res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
             return;
        }else if(montoConsumidoFinal <= 0){
             var msj = `La embarcación ${resultHabilitacionEmbarcacion['d:Descripcion']} no cuenta con linea de crédito suficiente para solicitar la habilitación.`
             res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
             return;
        }
        var sUsuarioRegistro = config.app.module.s4hana.username;
        var dFechaRegistro = moment().format()+"Z";
        var sUsuarioActualiza = config.app.module.s4hana.username;
        var dFechaActualiza = null;
        var sUsuarioActualiza = null;
        var sRazonSocial = resultToken.razonSocialEmpresa;
        var xActivo = true;
        var sIDWorklow = '';
        var sID = uuidv4();  
        var sCodHabilitacion = "01";
        var sMontoSolicitado = montoSolicitud.toString();
        var sViaPago = viaPago;

        var resultPlanta = await wsZSCP_ARMADORES_SRV.getTipoPlanta(planta);
        var sPlanta = planta;
        var sPlantaDes = resultPlanta['d:Descripcion'];

        var resultEmbarcacion = await wsZSCP_ARMADORES_SRV.getTipoEmbarcacion(resultToken.rucEmpresa, embarcacion);
        var sEmbarcacion = embarcacion;
        var sEmbarcacionDes = resultEmbarcacion['d:Descripcion']; 
        
        var sTemporada = await utilWorkflowAprobacion.obtenerTemporadaActual();

        var sTasaDescuento = "0";
        var sDetalle = detalle;
        var sIDRUC = resultToken.rucEmpresa;
        var sArmador = resultToken.razonSocialEmpresa;

        var sEstado = "0";
        var sEstadoDet = "PENDIENTE";
        var sComment = "";
        var sUsertask = 'usertask8';
        var sTask = 'FLOTA';
        
        // var resultMaestraParametros = await wsZFISV_ARM_SRV_SRV.getMaestraParametros();
        
        var sGroup = '86C84562-95A0-4925-B2F6-F44BCA4EBFF6'; //HABILITACIONES
        var sMoneda = 'USD';

        // for(var i=0; i< resultMaestraParametros.length; i++){
        //     var parametro = resultMaestraParametros[i].content['m:properties'];
        //     if(parametro['d:vCodigo'] == 'sGroupAprobadorHabFlota'){
        //         sGroup = parametro['d:sContenido']
        //     }else if(parametro['d:vCodigo'] == 'sMonedaPorDefecto'){
        //         sMoneda = parametro['d:sContenido']
        //     }
        // }

        var sMessage = '';
        var sNumDoc = '';
        var sSociedad =  '';
        var sEjercicio = '';
        var sPosicion = '';
        var sAprobador = ''; 
        var nameUsuarioWorkflowAprobacion=sArmador+' - '+sEmbarcacionDes

        const firstApproverHabilitacion=await searchApproverOne('86C84562-95A0-4925-B2F6-F44BCA4EBFF6')
        const firstApproverHabilitacionUsername=firstApproverHabilitacion.username;
        const firstApproverTemplateHabilitacionId=firstApproverHabilitacion.id;
        const {nombresApellidos}=await findUser(firstApproverHabilitacionUsername)
        const fechaWorkflow = utilWorkflowAprobacion.obtenerFechaActual();

        const ObjForWorkflow={
            sID:sID,
            sDetalle:sDetalle,
            sUser:usernameMail,
            dFechaRegistro:fechaWorkflow,
            sCodHabilitacion: sCodHabilitacion,
            sMontoSolicitado: sMontoSolicitado,
            sViaPago: sViaPago,
            sPlanta: sPlanta,
            sPlantaDes: sPlantaDes,
            sEmbarcacion: sEmbarcacion,
            sEmbarcacionDes: sEmbarcacionDes,
            sRazonSocial: sRazonSocial,
            sTemporada: sTemporada || " ",
            sIDRUC: sIDRUC,
            sArmador: sArmador,
            sMoneda: sMoneda,
            aprobadorActual:nombresApellidos,
        }
        
        const workflowAprobacion=await crearWorkFlowAprobacion('86C84562-95A0-4925-B2F6-F44BCA4EBFF6',{nombre:nameUsuarioWorkflowAprobacion,data:'data',detalle:JSON.stringify(ObjForWorkflow)});
        logger.info(JSON.stringify(workflowAprobacion));
        var sIDWorklow=workflowAprobacion.data.dataValues.id

        var dataObj = {
            dFechaRegistro: dFechaRegistro,
            sUsuarioRegistro: sUsuarioRegistro,
            dFechaActualiza: dFechaActualiza,
            sUsuarioActualiza: sUsuarioActualiza,
            xActivo: xActivo,
            sIDWorklow: sIDWorklow,
            sID: sID,
            sCodHabilitacion: sCodHabilitacion,
            sMontoSolicitado: sMontoSolicitado,
            sViaPago: sViaPago,
            sPlanta: sPlanta,
            sPlantaDes: sPlantaDes,
            sEmbarcacion: sEmbarcacion,
            sEmbarcacionDes: sEmbarcacionDes,
            sRazonSocial: sRazonSocial,
            sTemporada: sTemporada,
            sTasaDescuento: sTasaDescuento,
            sDetalle: sDetalle,
            sIDRUC: sIDRUC,
            sArmador: sArmador,
            sEstado: sEstado,
            sEstadoDet: sEstadoDet,
            sComment: sComment,
            sUsertask: sUsertask,
            sTask: sTask,
            sGroup: sGroup,
            sMoneda: sMoneda,
            sMessage: sMessage,
            sNumDoc: sNumDoc,
            sSociedad: sSociedad,
            sEjercicio: sEjercicio,
            sPosicion: sPosicion,
            sAprobador: sAprobador
        };

       

        await crearRegistroAprobacionAprobador(sIDWorklow,firstApproverTemplateHabilitacionId,firstApproverHabilitacionUsername,detalle=JSON.stringify(
           ObjForWorkflow ),'Pendiente')
            
        await crearRegistroSapId(sIDWorklow,'86C84562-95A0-4925-B2F6-F44BCA4EBFF6')
        

        var resultHeaderCSRFToken = await wsZFISV_ARM_SRV_SRV.getCSRFToken('SolicitudPendHabilitacion');
        if(resultHeaderCSRFToken != null){
            var result = await wsZFISV_ARM_SRV_SRV.postSolicitudesPendientesHabilitacion(resultHeaderCSRFToken, dataObj);
            if(result){
                res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
                
                dataObj.dFechaRegistro = moment().toISOString();

                const dataObjForEmail = {
                    ...dataObj,
                    dFechaRegistro: moment(dataObj.dFechaRegistro).format('DD/MM/YYYY'),
                    sIdSolicitud:sIDWorklow
                };
                
                await sendApprovalEmail(firstApproverHabilitacionUsername,dataObjForEmail,"approval-request.html","Habilitacion")//primer aprobador
                await sendAllEmailHaydukUsers(dataObjForEmail,"notify-request.html","Habilitacion")//encargados


                return;
            }
        }
    }
    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
});
exports.registrarHabilitacionSolictud = registrarHabilitacionSolictud;

var editarHabilitacionSolictud = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-habilitaciones'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var habilitacionId = req.params.habilitacionId;

    var { montoSolicitud, planta, viaPago, embarcacion, detalle } = req.body;
  
    var resultSolicitudPendienteHabilitacion = await wsZFISV_ARM_SRV_SRV.getSolicitudPendienteHabilitacion(habilitacionId);
    
    if(resultSolicitudPendienteHabilitacion){
        if(resultSolicitudPendienteHabilitacion['d:sEstado'] == 1){
            var msj = `La solicitud se encuentra aprobada y no puede ser modificada.`;
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
            return;
        }else if(resultSolicitudPendienteHabilitacion['d:sEstado'] == 3){
            var msj = `La solicitud se encuentra en proceso de aprobacion y no puede ser modificada,`;
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
            return;
        }
    
        var resultHabilitacionEmbarcacion = await wsZSCP_ARMADORES_SRV.getHabilitacionEmbarcacion(resultToken.rucEmpresa, embarcacion);
        if(resultHabilitacionEmbarcacion){
            var montoDisponible = resultHabilitacionEmbarcacion['d:MontoDisponible'];
            var montoSolicitadoAnterior = resultSolicitudPendienteHabilitacion['d:sMontoSolicitado'];
            var montoConsumidoFinal = montoDisponible + montoSolicitadoAnterior - montoSolicitud;
    
            if(resultHabilitacionEmbarcacion['d:MontoDisponible'] <= 0){
                var msj = `La embarcación ${resultHabilitacionEmbarcacion['d:Descripcion']} no cuenta con linea de crédito para solicitar la habilitación.`
                res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
                return;
            }else if(montoConsumidoFinal <= 0){
                var msj = `La embarcación ${resultHabilitacionEmbarcacion['d:Descripcion']} no cuenta con linea de crédito suficiente para solicitar la habilitación.`
                res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
                return;
            }
    
            var dataObj = {};
            Object.keys(resultSolicitudPendienteHabilitacion).forEach(key => {
                var newKey = key.replace('d:','');
                dataObj[newKey] = resultSolicitudPendienteHabilitacion[key];
            });
    
            if(viaPago && dataObj['sViaPago'] != viaPago){
                dataObj['sViaPago'] = viaPago;        
            }
            
            if(planta && dataObj['sPlanta'] != planta){
                var resultPlanta = await wsZSCP_ARMADORES_SRV.getTipoPlanta(planta);
                dataObj['sPlanta'] = planta;
                dataObj['sPlantaDes'] = resultPlanta['d:Descripcion'];
            }
            
            if(embarcacion && dataObj['sEmbarcacion'] != embarcacion ){
                var resultEmbarcacion = await wsZSCP_ARMADORES_SRV.getTipoEmbarcacion(resultToken.rucEmpresa, embarcacion);
                dataObj['sEmbarcacion'] = embarcacion;
                dataObj['sEmbarcacionDes'] = resultEmbarcacion['d:Descripcion'];
            }
    
            if(montoSolicitud && dataObj['sMontoSolicitado'] != montoSolicitud){
                dataObj['sMontoSolicitado'] = montoSolicitud;
            }
    
            dataObj['sDetalle'] = detalle;
    
            //Convertimos los valores numericos a string como indica la refernencia.
            dataObj['sID'] = dataObj['sID'].toString();
            dataObj['sCodHabilitacion'] = dataObj['sCodHabilitacion'].toString();
            dataObj['sMontoSolicitado'] = dataObj['sMontoSolicitado'].toString();
            dataObj['sIDRUC'] = dataObj['sIDRUC'].toString();
            dataObj['sEstado'] = dataObj['sEstado'].toString();
            dataObj['sTasaDescuento'] = dataObj['sTasaDescuento'].toString();

            //Añadimos el usuario y fecha de actualizacion
            dataObj['dFechaActualiza'] = moment().format()+"Z";
            dataObj['sUsuarioActualiza'] = config.app.module.s4hana.username;
    
            var resultHeaderCSRFToken = await wsZFISV_ARM_SRV_SRV.getCSRFToken('SolicitudPendHabilitacion');
            if(resultHeaderCSRFToken != null){
                var result = await wsZFISV_ARM_SRV_SRV.putSolicitudesPendientesHabilitacion(resultHeaderCSRFToken, habilitacionId, dataObj);
                if(result === true){
                    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
                    return;
                }
            }
        }
    }
    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, "No se pudo procesar la solictiud de actualización de la habilitación.", null));
    return;
});
exports.editarHabilitacionSolictud = editarHabilitacionSolictud;

var eliminarHabilitacionSolictud = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-habilitaciones'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var habilitacionId = req.params.habilitacionId;

    var resultSolicitudPendienteHabilitacion = await wsZFISV_ARM_SRV_SRV.getSolicitudPendienteHabilitacion(habilitacionId);
    if(resultSolicitudPendienteHabilitacion['d:sEstado'] == 1){
        var msj = `La solicitud se encuentra aprobada, no puede ser eliminada.`;
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
        return;
    }
    
    if(resultSolicitudPendienteHabilitacion){
        var dataObj = {};
        Object.keys(resultSolicitudPendienteHabilitacion).forEach(key => {
            var newKey = key.replace('d:','');
            dataObj[newKey] = resultSolicitudPendienteHabilitacion[key];
        });
        //Asignamos los valores de eliminación
        dataObj['sEstado'] = "-100";
        dataObj['xActivo'] = false;

        //Convertimos los valores numericos a string como indica la refernencia.
        dataObj['sID'] = dataObj['sID'].toString();
        dataObj['sCodHabilitacion'] = dataObj['sCodHabilitacion'].toString();
        dataObj['sMontoSolicitado'] = dataObj['sMontoSolicitado'].toString();
        dataObj['sIDRUC'] = dataObj['sIDRUC'].toString();
        dataObj['sTasaDescuento'] = dataObj['sTasaDescuento'].toString();

        //Añadimos el usuario y fecha de actualizacion
        dataObj['dFechaActualiza'] = moment().format()+"Z";
        dataObj['sUsuarioActualiza'] = config.app.module.s4hana.username;

        var resultHeaderCSRFToken = await wsZFISV_ARM_SRV_SRV.getCSRFToken('SolicitudPendHabilitacion');
        if(resultHeaderCSRFToken != null){
            var result = await wsZFISV_ARM_SRV_SRV.deleteSolicitudesPendientesHabilitacion(resultHeaderCSRFToken, habilitacionId, dataObj);
            if(result === true){
                res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
                return;
            }
        }
    }
    
    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, "No se pudo procesar la solictiud de la eliminación de la habilitación.", null));
    return;
});
exports.eliminarHabilitacionSolictud = eliminarHabilitacionSolictud;


