'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const poolDBHana = require('../../../db/connectionDBHana');
const logger = require('../../../util/basic-logger');
const config = require('../../../config/config');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const redisCovidapp = require("../../../db/connectionRedisCovidapp")

const seguridadController = require("../../covidapp/controller/seguridad.controller");

const informeFlotaModel = require('../model/informe.flota.model');
const informeFlotaOdata=require('../../covidapp/sap_odata/ZCDSFI_308_INF_FLOTA')

exports.getXIF = awaitErrorHandlerFactory(async (req, res, next) => {
    var arrModulosIds= ['covidapp-general-informeFlota'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var keyRedis = "covidapp-informeFlotaModel-getXIF";
    var informeFlota = req.params.informeFlota;
    keyRedis = keyRedis+"-"+informeFlota;

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    try{
        // var resultQuery = await poolDBHana.executeQuery(informeFlotaModel.queryGetPorInformeFlota, [informeFlota]);
        var resultOdata= await informeFlotaOdata.getPorInformedeFlota({informeFlota})
        var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);
        if (formatResults.length == 0) {
            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
            return;
        }

        var resultArray = [];
        for(var i=0; i < formatResults.length; i++){
            var data = {
                informeFlota: formatResults[i].numinf,
                plantaId: formatResults[i].werdes,
                plantaNombre: formatResults[i].name1,
                armador: {
                    id: formatResults[i].armador,
                    nombre: formatResults[i].full_name,
                    ruc: formatResults[i].taxnum,
                    email: formatResults[i].smtp_addr,
                    telefono: formatResults[i].tel_number,
                    celular: formatResults[i].telnr_long
                },
                embarcacion: {
                    id: formatResults[i].matr_sap,
                    nombre: formatResults[i].embarc,
                    matricula: formatResults[i].matricula,
                    codMatricula: formatResults[i].cod_matr
                }
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
