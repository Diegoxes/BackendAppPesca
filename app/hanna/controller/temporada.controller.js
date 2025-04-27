'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const poolDBHana = require('../../../db/connectionDBHana');
const logger = require('../../../util/basic-logger');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const redisCovidapp = require("../../../db/connectionRedisCovidapp")

const temporadaModel = require('../model/temporada.model');
const odataTemporada=require('../../covidapp/sap_odata/ZCDSPP_403_CDS_TEMPORADA')

var list = awaitErrorHandlerFactory(async (req, res, next) => {
    var keyRedis = "covidapp-temporadaModel-list";

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    try{
        // var resultArray = await poolDBHana.executeQuery(temporadaModel.queryHANATemporadas, []);
        var resultArray=await odataTemporada.getTemporadas()
        var resultArray=resultArray.d.results.map(({ __metadata, ...rest }) => rest);
        
        await redisCovidapp.setKey(keyRedis, resultArray, 43200); // 12 horas
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultArray));
    }catch(exp){
        logger.error(exp);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, constants.MENSAJE.SERVIDOR.ERROR, null));
        return;
    }

});
exports.list = list;