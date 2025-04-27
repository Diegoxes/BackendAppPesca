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
const {crearRegistroSapId}=require('./workflow.aprobacion.controller');
const {crearRegistroAprobacionAprobador}=require('./workflow.aprobacion.controller')
const {crearWorkFlowAprobacion}=require('./workflow.template.controller')
const {sendApprovalEmail}=require('./workflow.aprobacion.controller')
const {sendAllEmailHaydukUsers}=require('./workflow.aprobacion.controller')
const {searchApproverOne,findUser}=require('./workflow.aprobacion.controller')
const utilWorkflowAprobacion=require('../../../util/utilWorkflowAprobacion')

const uuidv4 = require('uuid').v4;

var listarAdelantosEmbarcacion = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-adelantos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getAdelantosEmbarcaciones(resultToken.rucEmpresa);
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
exports.listarAdelantosEmbarcacion = listarAdelantosEmbarcacion;

var listarAdelantosEmbarcacionDetalle = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-adelantos'];
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

    var result = await wsZSCP_ARMADORES_SRV.getDetalleAdelantosEmbarcacion(resultToken.rucEmpresa, embarcacion, fechaInicio, fechaFin);
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
exports.listarAdelantosEmbarcacionDetalle = listarAdelantosEmbarcacionDetalle;

var listarAdelantoDetallePagos = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-adelantos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var adelantoId = req.query.adelantoId;
    var ejercicio = req.query.ejercicio;
    var posicion = req.query.posicion;
    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getDetalleAdelantosPagos(resultToken.rucEmpresa, adelantoId, ejercicio, posicion);
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
exports.listarAdelantoDetallePagos = listarAdelantoDetallePagos;

var listarAdelantoDescuentos = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-adelantos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var embarcacion = req.query.embarcacion;
    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getDescuentosEmbarcacion(resultToken.rucEmpresa, embarcacion);
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
exports.listarAdelantoDescuentos = listarAdelantoDescuentos;

var listarAdelantoDescuentoDetalle = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-adelantos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var embarcacion = req.query.embarcacion;
    var tipoDescuento = req.query.tipoDescuento;
    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getDescuentosEmbarcacionDetalle(resultToken.rucEmpresa, embarcacion, tipoDescuento);
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
exports.listarAdelantoDescuentoDetalle = listarAdelantoDescuentoDetalle;

var listarAdelantoSolictudes = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-adelantos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZFISV_ARM_SRV_SRV.getSolicitudesPendientesAdelanto(resultToken.rucEmpresa);
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
exports.listarAdelantoSolictudes = listarAdelantoSolictudes;


var registrarAdelantoSolictud = awaitErrorHandlerFactory(async (req,res, next)=>{

    var arrModulosIds= ['covidapp-adelantos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token); //resultToken.username para enviar el correo
    const usernameMail=resultToken.username

    var { montoSolicitud, planta, viaPago, embarcacion, detalle } = req.body;
    
    /*
    CAMBIO 29/10/2024
    Se cambio a obtener los datos de la embarcacion por el metodo getAdelantosEmbarcaciones 
    porque el metodo getAdelantoEmbarcacion retorna como valores de monto disponible 0 cuando si se tiene disponible... 
    revisar en algun momento con el equipo de SAP
    */

    var resultAdelantoEmbarcaciones = await wsZSCP_ARMADORES_SRV.getAdelantosEmbarcaciones(resultToken.rucEmpresa);
    
    var resultAdelantoEmbarcacion = null;
    if(typeof resultAdelantoEmbarcaciones == 'object'){
        var rowContent = resultAdelantoEmbarcaciones.content;
        var rowProperties = rowContent['m:properties']
        resultAdelantoEmbarcacion = rowProperties;
    }else{
        var resultAdelantoEmbarcacionFilter = resultAdelantoEmbarcaciones.filter((row)=>{
            var rowContent = row.content;
            var rowProperties = rowContent['m:properties']
            return rowProperties['d:Embarcacion'] == embarcacion;
        });
        
        if(resultAdelantoEmbarcacionFilter.length == 1){
            resultAdelantoEmbarcacion = resultAdelantoEmbarcacionFilter[0].content['m:properties']
        }
    }
    
    if(resultAdelantoEmbarcacion){
        var montoMaximo = resultAdelantoEmbarcacion['d:MontoMaximo'];
        var montoConsumidoFinal = montoMaximo - montoSolicitud;

        if(resultAdelantoEmbarcacion['d:MontoMaximo'] <= 0){
             var msj = `La embarcación ${resultAdelantoEmbarcacion['d:Descripcion']} no cuenta con linea de crédito para solicitar el adelanto.`
             res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
             return;
        }else if(montoConsumidoFinal <= 0){
             var msj = `La embarcación ${resultAdelantoEmbarcacion['d:Descripcion']} no cuenta con linea de crédito suficiente para solicitar el adelanto.`
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
        var sIDWorklow = ''
        var sID = uuidv4();
        var sCodAdelanto = "03";
        var sMontoSolicitado = montoSolicitud.toString();
        var sViaPago = viaPago;

        var resultPlanta = await wsZSCP_ARMADORES_SRV.getTipoPlanta(planta);
        var sPlanta = planta;
        var sPlantaDes = resultPlanta['d:Descripcion'];
    
        var resultEmbarcacion = await wsZSCP_ARMADORES_SRV.getTipoEmbarcacion(resultToken.rucEmpresa, embarcacion);
        var sEmbarcacion = embarcacion;
        var sEmbarcacionDes = resultEmbarcacion['d:Descripcion']; 
        
        var sTemporada = await utilWorkflowAprobacion.obtenerTemporadaActual();
        var sTasaDescuento = null;
        var sDetalle = detalle;
        var sIDRUC = resultToken.rucEmpresa;
        var sArmador = resultToken.razonSocialEmpresa;

        var sEstado = "0";
        var sEstadoDet = "PENDIENTE";
        var sComment = "";
        var sUsertask = 'usertask8';
        var sTask = 'FLOTA';
        // var resultMaestraParametros = await wsZFISV_ARM_SRV_SRV.getMaestraParametros();
        var sGroup = '5BAC0EDA-FEA7-494E-9BBD-C624E3C25BEB'; //WORKFLOW_TEMPLATE_ID
        var sMoneda = 'USD';

        // for(var i=0; i< resultMaestraParametros.length; i++){
        //     var parametro = resultMaestraParametros[i].content['m:properties'];
        //     if(parametro['d:vCodigo'] == 'sGroupAprobadorAdeFlota'){
        //         sGroup = parametro['d:sContenido']
        //     }else if(parametro['d:vCodigo'] == 'sMonedaPorDefecto'){
        //         sMoneda = parametro['d:sContenido']
        //     }
        //         if(parametro['d:vCodigo'] == 'sMonedaPorDefecto'){
        //             sMoneda = parametro['d:sContenido']
        //         }
        // }

        var sMessage = '';
        var sNumDoc = '';
        var sSociedad =  '';
        var sEjercicio = '';
        var sPosicion = '';
        var sAprobador = ''; 
        
        var nameUsuarioWorkflowAprobacion=sArmador+' - '+sEmbarcacionDes

        const firstApprover=await searchApproverOne(sGroup);
      
        const firstApproverUsername=firstApprover.username
        const {nombresApellidos}=await findUser(firstApproverUsername)
       
     
        const firstApproverTemplateApproverId=firstApprover.id
       
        const fechaWorkflow = await utilWorkflowAprobacion.obtenerFechaActual() 
        const workflowAprobacion = await crearWorkFlowAprobacion(sGroup, { nombre:nameUsuarioWorkflowAprobacion, data: 'data', detalle: JSON.stringify({
            sID: sID,
            sUser:usernameMail,
            dFechaRegistro:fechaWorkflow,
            sCodAdelanto: sCodAdelanto,
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
            aprobadorActual:nombresApellidos
        }) }); 

        
        var sIDWorklow = workflowAprobacion.data.dataValues.id; 
        

        var dataObj = {
            dFechaRegistro: dFechaRegistro,
            sUsuarioRegistro: sUsuarioRegistro,
            dFechaActualiza: dFechaActualiza,
            sUsuarioActualiza: sUsuarioActualiza,
            xActivo: xActivo,
            sIDWorklow: sIDWorklow,
            sID: sID,
            sCodAdelanto: sCodAdelanto,
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
       
        crearRegistroAprobacionAprobador(sIDWorklow,firstApproverTemplateApproverId,firstApproverUsername, detalle = JSON.stringify({
            sID: sID,
            sCodAdelanto: sCodAdelanto,
            sMontoSolicitado: sMontoSolicitado,
            sViaPago: sViaPago,
            sPlanta: sPlanta,
            sPlantaDes: sPlantaDes,
            sEmbarcacion: sEmbarcacion,
            sEmbarcacionDes: sEmbarcacionDes,
            sRazonSocial: sRazonSocial,
            sTemporada: sTemporada,
            sIDRUC: sIDRUC,
            sArmador: sArmador,
            sMoneda: sMoneda
        }), 'Pendiente');
        
        await crearRegistroSapId(sIDWorklow,sGroup);
        logger.info(JSON.stringify(crearRegistroAprobacionAprobador));
    
        var resultHeaderCSRFToken = await wsZFISV_ARM_SRV_SRV.getCSRFToken('SolicitudPendAdelanto');
        if(resultHeaderCSRFToken != null){
            var result = await wsZFISV_ARM_SRV_SRV.postSolicitudesPendientesAdelanto(resultHeaderCSRFToken, dataObj);
            logger.info(JSON.stringify(result));
            if(result){  
                res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
                
                dataObj.dFechaRegistro = moment().toISOString();
                
                const dataObjForEmail = {
                    ...dataObj,
                    aprobadorActual:firstApproverUsername,
                    dFechaRegistro: moment(dataObj.dFechaRegistro).format('DD/MM/YYYY'),
                    sIdSolicitud:sIDWorklow
                };
                    await sendAllEmailHaydukUsers(dataObjForEmail,"notify-request.html","Adelanto")
                    await sendApprovalEmail(firstApproverUsername,dataObjForEmail,"approval-request.html","Adelanto")

                return;
            }
        }
       
    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, null, null));
});
exports.registrarAdelantoSolictud = registrarAdelantoSolictud;


var editarAdelantoSolictud = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-adelantos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var adelantoId = req.params.adelantoId;
    
    var { montoSolicitud, planta, viaPago, embarcacion, detalle } = req.body;

    var resultSolicitudPendienteAdelanto = await wsZFISV_ARM_SRV_SRV.getSolicitudPendienteAdelanto(adelantoId);
    if(resultSolicitudPendienteAdelanto){
        
        if(resultSolicitudPendienteAdelanto['d:sEstado'] == 1){
            var msj = `La solicitud se encuentra aprobada y no puede ser modificada.`;
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
            return;
        }else if(resultSolicitudPendienteAdelanto['d:sEstado'] == 3){
            var msj = `La solicitud se encuentra en proceso de aprobacion y no puede ser modificada,`;
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
            return;
        }
    
        var resultAdelantoEmbarcacion = await wsZSCP_ARMADORES_SRV.getAdelantoEmbarcacion(resultToken.rucEmpresa, embarcacion);
        if(resultAdelantoEmbarcacion){
            var montoMaximo = resultAdelantoEmbarcacion['d:MontoMaximo'];
            var montoSolicitadoAnterior = resultSolicitudPendienteAdelanto['d:sMontoSolicitado'];
            var montoConsumidoFinal = montoMaximo + montoSolicitadoAnterior - montoSolicitud;
            if(resultAdelantoEmbarcacion['d:MontoMaximo'] <= 0){
                var msj = `La embarcación ${resultAdelantoEmbarcacion['d:Descripcion']} no cuenta con linea de crédito para solicitar el adelanto.`
                res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
                return;
            }else if(montoConsumidoFinal <= 0){
                var msj = `La embarcación ${resultAdelantoEmbarcacion['d:Descripcion']} no cuenta con linea de crédito suficiente para solicitar el adelanto.`
                res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
                return;
            }
            var dataObj = {};
            Object.keys(resultSolicitudPendienteAdelanto).forEach(key => {
                var newKey = key.replace('d:','');
                dataObj[newKey] = resultSolicitudPendienteAdelanto[key];
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
    
            dataObj['sID'] = dataObj['sID'].toString();
            dataObj['sCodAdelanto'] = dataObj['sCodAdelanto'].toString();
            dataObj['sMontoSolicitado'] = dataObj['sMontoSolicitado'].toString();
            dataObj['sIDRUC'] = dataObj['sIDRUC'].toString();
            dataObj['sEstado'] = dataObj['sEstado'].toString();
    
            dataObj['dFechaActualiza'] = moment().format()+"Z";
            dataObj['sUsuarioActualiza'] = config.app.module.s4hana.username;
    
            var resultHeaderCSRFToken = await wsZFISV_ARM_SRV_SRV.getCSRFToken('SolicitudPendAdelanto');
            if(resultHeaderCSRFToken != null){

                var result = await wsZFISV_ARM_SRV_SRV.putSolicitudesPendientesAdelanto(resultHeaderCSRFToken, adelantoId, dataObj);
                if(result === true){
                    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
                    return;
                }
            }
        }
        
    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, "No se pudo procesar la solictiud de actualización del adelanto.", null));
    return;
});
exports.editarAdelantoSolictud = editarAdelantoSolictud;

var eliminarAdelantoSolictud = awaitErrorHandlerFactory(async (req,res, next)=>{
    var arrModulosIds= ['covidapp-adelantos'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var adelantoId = req.params.adelantoId;

    var resultSolicitudPendienteAdelanto = await wsZFISV_ARM_SRV_SRV.getSolicitudPendienteAdelanto(adelantoId);
    if(resultSolicitudPendienteAdelanto['d:sEstado'] == 1){
        var msj = `La solicitud se encuentra aprobada, no puede ser eliminada.`;
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_CAMPO_NO_VALIDO, msj, null));
        return;
    }

    if(resultSolicitudPendienteAdelanto){
        var dataObj = {};
        Object.keys(resultSolicitudPendienteAdelanto).forEach(key => {
            var newKey = key.replace('d:','');
            dataObj[newKey] = resultSolicitudPendienteAdelanto[key];
        });
        
        dataObj['sEstado'] = "-100";
        dataObj['xActivo'] = false;

        dataObj['sID'] = dataObj['sID'].toString();
        dataObj['sCodAdelanto'] = dataObj['sCodAdelanto'].toString();
        dataObj['sMontoSolicitado'] = dataObj['sMontoSolicitado'].toString();
        dataObj['sIDRUC'] = dataObj['sIDRUC'].toString();
        dataObj['sDetalle'] = dataObj['sDetalle'].toString();
        dataObj['dFechaActualiza'] = moment().format()+"Z";
        dataObj['sUsuarioActualiza'] = config.app.module.s4hana.username;

        var resultHeaderCSRFToken = await wsZFISV_ARM_SRV_SRV.getCSRFToken('SolicitudPendAdelanto');
        if(resultHeaderCSRFToken != null){
            var result = await wsZFISV_ARM_SRV_SRV.deleteSolicitudesPendientesAdelanto(resultHeaderCSRFToken, adelantoId, dataObj);
            if(result === true){
                res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
                return;
            }
        }
    }
    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, "No se pudo procesar la solictiud de la eliminación del adelanto.", null));
    return;
});
exports.eliminarAdelantoSolictud = eliminarAdelantoSolictud;
