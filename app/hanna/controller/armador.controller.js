'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const poolDBHana = require('../../../db/connectionDBHana');
const logger = require('../../../util/basic-logger');
const config = require('../../../config/config');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const redisCovidapp = require("../../../db/connectionRedisCovidapp")

const armadorModel = require('../model/armador.model');
const armadorOdata= require("../../covidapp/sap_odata/ZCDSFI_014_CDS_ARMADOR")

var list = awaitErrorHandlerFactory(async (req, res, next) => {
    var keyRedis = "covidapp-armadorModel-list";
    var nombre = req.query.nombre;
    var ruc = req.query.ruc;

    keyRedis = keyRedis+"-"+nombre+"-"+ruc;
    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }
    var taxNum=ruc
    try{
        var resultOdata = [];
        if(nombre != ''){
            // resultQuery = await poolDBHana.executeQuery(armadorModel.queryListByName, [`%${nombre.toUpperCase()}%`]);
            resultOdata= await armadorOdata.getArmadorList({nombre})
        }else if(ruc != ''){
            // resultQuery = await poolDBHana.executeQuery(armadorModel.queryListByRuc, [`%${ruc}%`]);
            resultOdata= await armadorOdata.getArmadorList({taxNum})
        }else if(nombre != '' && ruc != ''){
            // resultQuery = await poolDBHana.executeQuery(armadorModel.queryListByNameOrRuc, [`%${nombre.toUpperCase()}%`, `%${ruc}%`]);
            resultOdata= await armadorOdata.getArmadorList({nombre,taxNum})
        }else{
            resultQuery = await poolDBHana.executeQuery(armadorModel.queryList, []);
        }
        
        var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);
        var resultArray = [];
        for(var i=0; i < formatResults.length; i++){
            var data = {
                id: formatResults[i].partner,
                nombre: formatResults[i].name1,
                ruc: formatResults[i].taxnum,
                email:formatResults[i].smtp_addr,
                telefono:formatResults[i].tel_number,
                celular:formatResults[i].telnr_long
            };

            resultArray.push(data);
        }

        await redisCovidapp.setKey(keyRedis, resultArray, 3600);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultArray));
    }catch(exp){
        logger.error(exp);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, constants.MENSAJE.SERVIDOR.ERROR, null));
        return;
    }

});
exports.list = list;

var get = awaitErrorHandlerFactory(async (req, res, next) => {
    var keyRedis = "covidapp-armadorModel-get";
    var armador = req.params.armador;

    if(armador == null || armador == ''){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
        return;
    }

    keyRedis = keyRedis+" - " + armador;

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }
    const partner=armador
    try{
        // var resultQuery = await poolDBHana.executeQuery(armadorModel.queryGet, [armador]);
        var resultOdata= await armadorOdata.getArmadorList({partner})
        var formatResults= resultOdata.d.results.map(({ __metadata, ...rest }) => rest);
        var data = null
        if(formatResults.length > 0){
            data = {
                id: formatResults[0].partner,
                nombre: formatResults[0].name1,
                ruc: formatResults[0].taxNum,
                email:formatResults[0].smtp_addr,
                telefono:formatResults[0].tel_number,
                celular:formatResults[0].telnr_long
            };
        }
        await redisCovidapp.setKey(keyRedis, data, 3600);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, data));
        
    }catch(exp){
        logger.error(exp);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, constants.MENSAJE.SERVIDOR.ERROR, null));
        return;
    }
});
exports.get = get;