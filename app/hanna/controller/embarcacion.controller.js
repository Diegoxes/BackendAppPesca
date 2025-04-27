'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const poolDBHana = require('../../../db/connectionDBHana');
const logger = require('../../../util/basic-logger');
const config = require('../../../config/config');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const redisCovidapp = require("../../../db/connectionRedisCovidapp")

const usuarioModel = require('../../covidapp/sequelize').Usuario;

const embarcacionModel = require('../model/embarcacion.model');
const armadorModel =  require('../model/armador.model');
const odataEmbarcacion=require('../../covidapp/sap_odata/ZCDSFI_307_EMB_ARMADOR')
const odataArmador=require('../../covidapp/sap_odata/ZCDSFI_014_CDS_ARMADOR');

var list = awaitErrorHandlerFactory(async (req, res, next) => {

    var keyRedis = "covidapp-embarcacionModel-list";
    var nombre = req.query.nombre;
    var matricula = req.query.matricula;
    keyRedis = keyRedis+"-"+nombre+"-"+matricula;

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }
    try{
        var resultOdata = [];
        if(nombre != ''){
            // resultQuery = await poolDBHana.executeQuery(embarcacionModel.queryListByName, [`%${nombre.toUpperCase()}%`]);
            resultOdata= await odataEmbarcacion.getEmbarcacionListByName(nombre)
        }else if(matricula != ''){
            // resultQuery = await poolDBHana.executeQuery(embarcacionModel.queryListByMatricula, [`%${matricula}%`]);
            resultOdata= await odataEmbarcacion.getEmbarcacionListByMatricula(matricula)
        }else if(nombre != '' && matricula != ''){
            // resultQuery = await poolDBHana.executeQuery(embarcacionModel.queryListByNameOrMatricula, [`%${nombre.toUpperCase()}%`, `%${matricula}%`]);
            resultOdata= await odataEmbarcacion.getEmbarcacionListByNameOrMatricula({nombre,matricula})
        }else{
            resultOdata= await poolDBHana.executeQuery(embarcacionModel.queryList, []);
            //no hay odata 
        }

        var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);

        var resultArray = [];
        for(var i=0; i < formatResults.length; i++){
            var data = {
                id: formatResults[i].lifnr,
                nombre: formatResults[i].name1,
                matricula: formatResults[i].matricula,
                armadorId: formatResults[i].lifn2
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

var listPorArmador = awaitErrorHandlerFactory(async (req, res, next) => {
    
    var keyRedis = "covidapp-embarcacionModel-listPorArmador";
    var armador = req.params.armador;

    if(armador == null || armador == ''){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, []));
        return;
    }

    keyRedis = keyRedis+"-"+armador;
    var resultToken=await odataEmbarcacion.getCSRFToken()

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    try{
        // var resultQuery = await poolDBHana.executeQuery(embarcacionModel.queryListPorArmador, [armador]);
        var resultOdata= await odataEmbarcacion.getEmbarcacionListPorArmador(armador);
        var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);

        var resultArray = [];
        for(var i=0; i < formatResults.length; i++){
            var data = {
                id: formatResults[i].lifnr,
                nombre: formatResults[i].name1,
                matricula: formatResults[i].matricula,
                armadorId: formatResults[i].lifn2
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
exports.listPorArmador = listPorArmador;

var listPorArmador2 = awaitErrorHandlerFactory(async (req, res, next) => {
    
    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);
    var keyRedisUsuarioArmador = "covidapp-embarcacionModel-listPorArmador2-armador-"+resultToken.username;
    var resultUsuarioArmador = await redisCovidapp.getKey(keyRedisUsuarioArmador);
    if (resultUsuarioArmador == null) {
      var resultUsuario = await usuarioModel.findOne({
          attributes: [
              'rucEmpresa'
          ],
          where: {
              username: resultToken.username
          }
      });
      const taxNum=resultUsuario.rucEmpresa
    //   var resultUsuarioArmadorHanna = await poolDBHana.executeQuery(armadorModel.queryListByRuc, [resultUsuario.rucEmpresa]);
      var resultOdata=await odataArmador.getArmadorList({taxNum})
      var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);
    
      if(formatResults.length > 0){
        resultUsuarioArmador = formatResults[0];
        await redisCovidapp.setKey(keyRedisUsuarioArmador, resultUsuarioArmador, 3600);
      }else{
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, "No se pudo encontrar los datos del armador.", null));
        return;
      }
    }

    var keyRedisEmbarcacion = "covidapp-embarcacionModel-listPorArmador2-"+resultUsuarioArmador.partner;
    var resultRedisEmbarcacion = await redisCovidapp.getKey(keyRedisEmbarcacion);
    if (resultRedisEmbarcacion != null) {
      res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedisEmbarcacion));
      return;
    }

    try{
       // var resultQuery = await poolDBHana.executeQuery(embarcacionModel.queryListPorArmador, [resultUsuarioArmador.PARTNER]);
       
        var resultOdata= await odataEmbarcacion.getEmbarcacionListPorArmador(resultUsuarioArmador.partner)
        var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);
        
        var resultArray = [];
        for(var i=0; i < formatResults.length; i++){
            var data = {
                id: formatResults[i].lifnr,
                nombre: formatResults[i].name1,
                matricula: formatResults[i].matricula,
                armadorId: formatResults[i].lifn2
            };

            resultArray.push(data);
        }

        await redisCovidapp.setKey(keyRedisEmbarcacion, resultArray, 3600);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultArray));

    }catch(exp){
        logger.error(exp);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, constants.MENSAJE.SERVIDOR.ERROR, null));
        return;
    }
});
exports.listPorArmador2 = listPorArmador2;

var listPorArmadorRuc = awaitErrorHandlerFactory(async (req, res, next) => {
    var keyRedis = "covidapp-embarcacionModel-listPorArmadorRuc";
    var ruc = req.params.ruc;
    if(ruc == null || ruc == ''){
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, []));
        return;
    }

    keyRedis = keyRedis+"-"+ruc;

    var resultRedis = await redisCovidapp.getKey(keyRedis)
    if (resultRedis != null) {
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultRedis));
        return;
    }

    const armadorRuc=ruc;
    try{
        // var resultQuery = await poolDBHana.executeQuery(embarcacionModel.queryListPorArmadorRuc, [ruc]);
        var resultOdata= await odataEmbarcacion.getEmbarcacionPorArmadorRucYCodigo({armadorRuc});
        var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);
        
        var resultArray = [];
        for(var i=0; i < formatResults.length; i++){
            var data = {
                id: formatResults[i].lifnr,
                nombre: formatResults[i].name1,
                matricula: formatResults[i].matricula,
                armadorId: formatResults[i].lifn2
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
exports.listPorArmadorRuc = listPorArmadorRuc;