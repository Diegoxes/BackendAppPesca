'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const seguridadController = require("./seguridad.controller");

const poolDBHana = require('../../../db/connectionDBHana');
const ordenCompraModel = require('../../hanna/model/orden.compra.model');
const oDataOrdenesCompra=require('../sap_odata/ZCDSMM_015_CDS_ORDEN_COMPRA')

var listOrdenCompraByArmador = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-ordenesCompra'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var fechaInicio = req.query.fechaInicio;
    var fechaFin = req.query.fechaFin;
    var codigoEmbarcacion = req.query.embarcacion;

    

    //Query de data
    // var queryHana = ordenCompraModel.queryHANAOrdenesCompraArmador.replace('%RUC%',resultToken.rucEmpresa)
    //                     .replace('%FEC_INI%',fechaInicio)
    //                     .replace('%FEC_FIN%',fechaFin)
    //                     .replace('%LIMIT%',regPag)
    //                     .replace('%OFFSET%',offSet);
    // if(codigoEmbarcacion && codigoEmbarcacion != ''){
    //     queryHana = queryHana.replace('%EMBARCACION_FILTER%',`AND LIFNR = '${codigoEmbarcacion}'`);
    // }else{
    //     queryHana = queryHana.replace('%EMBARCACION_FILTER%',``);
    // }
    // var resultData = await poolDBHana.executeQuery(queryHana);
    var rucEmpresa=resultToken.rucEmpresa
    var resultOdata= await oDataOrdenesCompra.getOrdenesCompraArmador({regPag,offSet,fechaInicio,fechaFin,codigoEmbarcacion,rucEmpresa})
    var resultData=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);

    //Query de count
    // var queryCount = ordenCompraModel.queryHANAOrdenesCompraArmadorCount.replace('%RUC%',resultToken.rucEmpresa)
    //                     .replace('%FEC_INI%',fechaInicio)
    //                     .replace('%FEC_FIN%',fechaFin);

    // var queryCount=oDataOrdenesCompra.getOrdenesCompraArmadorCount(rucEmpresa,fechaInicio,fechaFin)

    // if(codigoEmbarcacion && codigoEmbarcacion != ''){
    //     queryCount = queryCount.replace('%EMBARCACION_FILTER%',`AND LIFNR = '${codigoEmbarcacion}'`);
    // }else{
    //     queryCount = queryCount.replace('%EMBARCACION_FILTER%',``);
    // }
    // var resultCount = await poolDBHana.executeQuery(queryCount);
    var resultCount= await oDataOrdenesCompra.getOrdenesCompraArmadorCount({rucEmpresa,fechaInicio,fechaFin,codigoEmbarcacion})
    var resultCountOrdenes= resultCount.d.results.map(({ __metadata, ...rest }) => rest);

    var result = {
        rows:resultData,
        count: (resultCountOrdenes[0] && resultCountOrdenes[0].cantidad) 
    }
    
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listOrdenCompraByArmador = listOrdenCompraByArmador;
