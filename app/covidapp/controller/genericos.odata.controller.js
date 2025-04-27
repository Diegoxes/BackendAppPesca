'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util                     = require('../../../util/util');
const constants                = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');

const seguridadController = require("./seguridad.controller");

const wsZSCP_ARMADORES_SRV = require('../sap_odata/ZSCP_ARMADORES_SRV');
const wsZFISV_ARM_SRV_SRV = require('../sap_odata/ZFISV_ARM_SRV_SRV');

var listarParametros = awaitErrorHandlerFactory(async (req,res, next)=>{
    var dataReturn = {
        rows:[],
        count:0
    };
    
    var result = await wsZFISV_ARM_SRV_SRV.getMaestraParametros();
    var arrParametros = ['sBancoPermitidoIds','sHaydukRUC','sMonedaPorDefecto','sViaPagoTransferencia','sViaPagoCheque','sPlantaLimaId'];

    if(result)
        for(var i=0; i< result.length; i++){
            var parametro = result[i].content['m:properties'];
            if(arrParametros.includes(parametro['d:vCodigo'])){
                dataReturn.rows.push(parametro);
            }
        }

    dataReturn.count = dataReturn.rows.length;
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataReturn));
});
exports.listarParametros = listarParametros;

var listarTemporada = awaitErrorHandlerFactory(async (req,res, next)=>{
    var dataReturn = {
        rows:[],
        count:0
    };
    
    var result = await wsZSCP_ARMADORES_SRV.getTemporadas();
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
exports.listarTemporada = listarTemporada;

var listarTipoMoneda = awaitErrorHandlerFactory(async (req,res, next)=>{
    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getTiposMoneda();
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
exports.listarTipoMoneda = listarTipoMoneda;

var listarTipoPlanta = awaitErrorHandlerFactory(async (req,res, next)=>{
    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getTiposPlanta();
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
exports.listarTipoPlanta = listarTipoPlanta;


var listarTipoViaPagoArmador = awaitErrorHandlerFactory(async (req,res, next)=>{
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getTiposViaPago(resultToken.rucEmpresa);
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
exports.listarTipoViaPagoArmador = listarTipoViaPagoArmador;

var listarEmbarcacionesArmador = awaitErrorHandlerFactory(async (req,res, next)=>{
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    
    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getTiposEmbarcacion(resultToken.rucEmpresa);
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
exports.listarEmbarcacionesArmador = listarEmbarcacionesArmador;

var obtenerDatosArmador = awaitErrorHandlerFactory(async (req,res, next)=>{
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    
    var dataReturn = null;

    var result = await wsZSCP_ARMADORES_SRV.getDatosArmador(resultToken.rucEmpresa);
    if(result){
        dataReturn = result.content['m:properties'];
    }
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataReturn));
});
exports.obtenerDatosArmador = obtenerDatosArmador;

var obtenerCuentasArmador = awaitErrorHandlerFactory(async (req,res, next)=>{
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    
    var dataReturn = {
        rows:[],
        count:0
    };

    var result = await wsZSCP_ARMADORES_SRV.getCuentasBancariasArmador(resultToken.rucEmpresa);
    if(result){
        if(!Array.isArray(result) && typeof result === 'object')
            result = [result];

        dataReturn.rows = result.map((value)=>{
            var data = value.content['m:properties'];

            return data;
        });
        
        dataReturn.count = dataReturn.rows.length;

    }
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, dataReturn));
});
exports.obtenerCuentasArmador = obtenerCuentasArmador;

