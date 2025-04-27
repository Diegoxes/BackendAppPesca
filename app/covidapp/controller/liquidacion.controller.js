'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util                     = require('../../../util/util');
const constants                = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');

const seguridadController = require("./seguridad.controller");

const wsZSCP_ARMADORES_SRV = require('../sap_odata/ZSCP_ARMADORES_SRV');
const wsHaydukServicesProxy = require('../../../lib/hayduk_services/hayduk.ws.services.proxy');

const base64 = require('base64topdf');

var listarLiquidaciones = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-liquidaciones'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var fecha = req.query.fecha;
    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getLiquidacionSet(resultToken.rucEmpresa, fecha);
    if(result){
        if(!Array.isArray(result) && typeof result === 'object')
            result = [result];

        dataReturn.rows = result.map((value)=>{
            var dataLiq = value.content['m:properties'];
  
            if(typeof dataLiq['d:Detraccion'] === 'string'){
                if(dataLiq['d:Detraccion'].indexOf("-") < 0){
                    dataLiq['d:Detraccion'] = `-${dataLiq['d:Detraccion']}`;
                }
            }else if(typeof dataLiq['d:Detraccion'] === 'number'){
                if(dataLiq['d:Detraccion'] > 0){
                    dataLiq['d:Detraccion'] = dataLiq['d:Detraccion'] * -1;
                }
            }

            if(typeof dataLiq['d:TotalDetraccion'] === 'string'){
                if(dataLiq['d:TotalDetraccion'].indexOf("-") < 0){
                    dataLiq['d:TotalDetraccion'] = `-${dataLiq['d:TotalDetraccion']}`;
                }
            }else if(typeof dataLiq['d:TotalDetraccion'] === 'number'){
                if(dataLiq['d:TotalDetraccion'] > 0){
                    dataLiq['d:TotalDetraccion'] = dataLiq['d:TotalDetraccion'] * -1;
                }
            }

            return dataLiq;
        });
        dataReturn.count = dataReturn.rows.length;
    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataReturn));
});
exports.listarLiquidaciones = listarLiquidaciones;

var detalleLiquidacion = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-liquidaciones'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    
    var liquidacionId = req.params.id;
    var dataReturn = {
        facturasXPagar:[],
        totalFacturasXPagar:0,
        descuentoFep:[],
        totalDescuentoFep:0,
        ventaPetroleo:[],
        totalVentaPetroleo:0,
        materialesServicios:[],
        totalMaterialesServicios:0,
        habilitaciones:[],
        totalHabilitaciones:0,
        adelantos:[],
        totalAdelantos:0,
        otrosDescuentos:[],
        totalOtrosDescuentos:0,
        detracciones:[],
        totalDetracciones:0,
        pagosFinancieros:[],
        totalPagosFinancieros:0
    };

    var resultFacturasXPagar = await wsZSCP_ARMADORES_SRV.getLiquidacionFacturasXPagar(resultToken.rucEmpresa, liquidacionId);
    //Verificamos el resultado. Si es un objeto lo convertimos en array
    if(!Array.isArray(resultFacturasXPagar) && typeof resultFacturasXPagar === 'object'){
        resultFacturasXPagar = [resultFacturasXPagar];
    }

    if(resultFacturasXPagar){
        dataReturn.facturasXPagar = resultFacturasXPagar.map((value)=>{
            return value.content['m:properties'];
        });
        dataReturn.totalFacturasXPagar = calcularTotalesDetalleLiquidacion(dataReturn.facturasXPagar, 'd:Monto');
    }
    
    var resultDescuentoFep = await wsZSCP_ARMADORES_SRV.getLiquidacionDescuentoFep(resultToken.rucEmpresa, liquidacionId);
    //Verificamos el resultado. Si es un objeto lo convertimos en array
    if(!Array.isArray(resultDescuentoFep) && typeof resultDescuentoFep === 'object'){
        resultDescuentoFep = [resultDescuentoFep];
    }
    if(resultDescuentoFep){
        dataReturn.descuentoFep = resultDescuentoFep.map((value)=>{
            return value.content['m:properties'];
        });
        dataReturn.totalDescuentoFep = calcularTotalesDetalleLiquidacion(dataReturn.descuentoFep, 'd:Monto');
    }
        
    var resultVentaPetroleo = await wsZSCP_ARMADORES_SRV.getLiquidacionVentaPetroleo(resultToken.rucEmpresa, liquidacionId);
    //Verificamos el resultado. Si es un objeto lo convertimos en array
    if(!Array.isArray(resultVentaPetroleo) && typeof resultVentaPetroleo === 'object'){
        resultVentaPetroleo = [resultVentaPetroleo];
    }
    if(resultVentaPetroleo){
        dataReturn.ventaPetroleo = resultVentaPetroleo.map((value)=>{
            return value.content['m:properties'];
        });
        dataReturn.totalVentaPetroleo = calcularTotalesDetalleLiquidacion(dataReturn.ventaPetroleo, 'd:Monto');
    }
    
    var resultMaterialesServicios = await wsZSCP_ARMADORES_SRV.getLiquidacionMaterialesServicios(resultToken.rucEmpresa, liquidacionId);
    //Verificamos el resultado. Si es un objeto lo convertimos en array
    if(!Array.isArray(resultMaterialesServicios) && typeof resultMaterialesServicios === 'object'){
        resultMaterialesServicios = [resultMaterialesServicios];
    }
    if(resultMaterialesServicios){
        dataReturn.materialesServicios = resultMaterialesServicios.map((value)=>{
            return value.content['m:properties'];
        });
        dataReturn.totalMaterialesServicios = calcularTotalesDetalleLiquidacion(dataReturn.materialesServicios, 'd:Monto');
    }

    var resultHabilitaciones = await wsZSCP_ARMADORES_SRV.getLiquidacionHabilitaciones(resultToken.rucEmpresa, liquidacionId);
    //Verificamos el resultado. Si es un objeto lo convertimos en array
    if(!Array.isArray(resultHabilitaciones) && typeof resultHabilitaciones === 'object'){
        resultHabilitaciones = [resultHabilitaciones];
    }
    if(resultHabilitaciones){
        dataReturn.habilitaciones = resultHabilitaciones.map((value)=>{
            return value.content['m:properties'];
        });
        dataReturn.totalHabilitaciones = calcularTotalesDetalleLiquidacion(dataReturn.habilitaciones, 'd:Monto');
    }

    var resultAdelantos = await wsZSCP_ARMADORES_SRV.getLiquidacionAdelantos(resultToken.rucEmpresa, liquidacionId);
    //Verificamos el resultado. Si es un objeto lo convertimos en array
    if(!Array.isArray(resultAdelantos) && typeof resultAdelantos === 'object'){
        resultAdelantos = [resultAdelantos];
    }
    if(resultAdelantos){
        dataReturn.adelantos = resultAdelantos.map((value)=>{
            return value.content['m:properties'];
        });
        dataReturn.totalAdelantos = calcularTotalesDetalleLiquidacion(dataReturn.adelantos, 'd:Monto');
    }

    var resultOtrosDescuentos = await wsZSCP_ARMADORES_SRV.getLiquidacionOtrosDescuentos(resultToken.rucEmpresa, liquidacionId);
    //Verificamos el resultado. Si es un objeto lo convertimos en array
    if(!Array.isArray(resultOtrosDescuentos) && typeof resultOtrosDescuentos === 'object'){
        resultOtrosDescuentos = [resultOtrosDescuentos];
    }
    if(resultOtrosDescuentos){
        dataReturn.otrosDescuentos = resultOtrosDescuentos.map((value)=>{
            return value.content['m:properties'];
        });
        dataReturn.totalOtrosDescuentos = calcularTotalesDetalleLiquidacion(dataReturn.otrosDescuentos, 'd:Monto');
    }

    var resultDetracciones = await wsZSCP_ARMADORES_SRV.getLiquidacionDetracciones(resultToken.rucEmpresa, liquidacionId);
    //Verificamos el resultado. Si es un objeto lo convertimos en array
    if(!Array.isArray(resultDetracciones) && typeof resultDetracciones === 'object'){
        resultDetracciones = [resultDetracciones];
    }

    //Convertimos las detracciones positivas en negativas para mostrarlo en el app como monto negativo
    for(var i=0; i<resultDetracciones.length; i++){
        if(typeof resultDetracciones[i].content['m:properties']['d:Monto'] === 'string'){
            if(resultDetracciones[i].content['m:properties']['d:Monto'].indexOf('-') < 0){
                resultDetracciones[i].content['m:properties']['d:Monto'] = `-${resultDetracciones[i].content['m:properties']['d:Monto']}`;
            }
        }else if(typeof resultDetracciones[i].content['m:properties']['d:Monto'] === 'number'){
            if(resultDetracciones[i].content['m:properties']['d:Monto'] > 0){
                resultDetracciones[i].content['m:properties']['d:Monto'] = resultDetracciones[i].content['m:properties']['d:Monto'] * -1;
            }
        }
    }

    if(resultDetracciones){
        dataReturn.detracciones = resultDetracciones.map((value)=>{
            return value.content['m:properties'];
        });
        dataReturn.totalDetracciones = calcularTotalesDetalleLiquidacion(dataReturn.detracciones, 'd:Monto');
    }

    var resultPagosFinancieros = await wsZSCP_ARMADORES_SRV.getLiquidacionPagosFinancieros(resultToken.rucEmpresa, liquidacionId);
    //Verificamos el resultado. Si es un objeto lo convertimos en array
    if(!Array.isArray(resultPagosFinancieros) && typeof resultPagosFinancieros === 'object'){
        resultPagosFinancieros = [resultPagosFinancieros];
    }
    if(resultPagosFinancieros){
        dataReturn.pagosFinancieros = resultPagosFinancieros.map((value)=>{
            return value.content['m:properties'];
        });
        dataReturn.totalPagosFinancieros = calcularTotalesDetalleLiquidacion(dataReturn.pagosFinancieros, 'd:Monto');
    }

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataReturn));

});
exports.detalleLiquidacion = detalleLiquidacion;

var descargarLiquidacion = awaitErrorHandlerFactory(async (req, res, next) => {
    var liquidacionId = req.params.id;
    try{
        var resultPDF = await wsZSCP_ARMADORES_SRV.getLiquidacionPDF(liquidacionId);
        var fileName = `liquidacion-${liquidacionId}.pdf`;
        var filePath = `data/liquidaciones/${fileName}`

        await base64.base64Decode(resultPDF.content['m:properties']['d:Documento'], filePath);
        res.download(filePath, fileName);
        return;
    }catch(err){
        console.log(err);
        logger.error(`${err.name} - ${err.message}`);
    }
});
exports.descargarLiquidacion = descargarLiquidacion;

var descargarLiquidacionDescuentoFep = awaitErrorHandlerFactory(async (req, res, next) => {
    var rucEmpresa = req.params.ruc;
    var documentoId = req.params.id;
    var ejercicio = req.params.ejercicio;
    var resultPDF = await wsZSCP_ARMADORES_SRV.getLiquidacionDescuentoFepPDF(rucEmpresa, documentoId, ejercicio);
        
    var fileName = `descuentoFEP-${documentoId}.pdf`;
    var filePath = `data/liquidaciones/${fileName}`
    await base64.base64Decode(resultPDF.content['m:properties']['d:Documento'], filePath);

    res.download(filePath, fileName);
    return;
});
exports.descargarLiquidacionDescuentoFep = descargarLiquidacionDescuentoFep;

var descargarFactura = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-liquidaciones'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    } 

    var folioId = req.params.folio;
    var resultPDF = await wsHaydukServicesProxy.onlineRecovery(
                        config.app.module.haydukServicesProxy.rucHayduk, 
                        '01', 
                        folioId, 
                        '2',
                        config.app.module.haydukServicesProxy.username,
                        config.app.module.haydukServicesProxy.password);
        
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultPDF));
    return;
});
exports.descargarFactura = descargarFactura;

var calcularTotalesDetalleLiquidacion = (items, columna) => {
    if(items.length == 0){
        return 0;
    }
    
    var total = 0;
    for(var i=0; i<items.length; i++){
        var monto = items[i][columna];
        if(monto === "0"){
            total+= 0;
        }else if(monto === 0){
            total+=0;
        }else if(typeof monto === 'number'){
            total+=monto;
        }else if(monto.indexOf("-") > 0){
            monto = "-"+monto.replace("-", "");
            monto = monto.replace(/,/,"");
            total+= parseFloat(monto);
        }else{
            monto = monto.replace(/,/,"");
            total+= parseFloat(monto);
        }
    }

    return total;
};