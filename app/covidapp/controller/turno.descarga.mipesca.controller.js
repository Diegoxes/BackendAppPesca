'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const logger = require('../../../util/basic-logger');
const config = require('../../../config/config');
const util = require('../../../util/util');
const constants = require('../../../config/constants');
const moment = require('moment');

const seguridadController = require("./seguridad.controller");

const poolDBHana = require('../../../db/connectionDBHana');
const turnoModel = require('../../hanna/model/turno.model');

const solicitudTurnoModel = require('../sequelize').SolicitudTurno;
const hannaWSArmadores = require('../../../lib/hanna_ws/hanna.ws.armadores')
const oDataTurno=require('../sap_odata/ZCDSPM_004_CDS_TURNO')

var obtenerTurnoDescargaXMatricula = awaitErrorHandlerFactory(async (req, res, next) => {
  var arrModulosIds = ['covidapp-mipesca-turnoDescarga'];
  
  if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
    return;
  }

  var matricula = req.params.matricula;
  try {
    var resultArray = [];
    var id=1;
    //Obtenemos mi turno... si no hay turno no continuamos
    // var resultQuery1 = await poolDBHana.executeQuery(turnoModel.queryMiTurmo, [matricula]);
    var resultOdata= await oDataTurno.getMiTurno({matricula})
    var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);

    if(formatResults.length > 0){
      var planta = formatResults[0].werks;
      var fecha = formatResults[0].fecha_desc;
      var turno = formatResults[0].turno;

      var data = {
        id:formatResults[0].correlativo,
        tipo:formatResults[0].tipo_turno,
        matricula: formatResults[0].matricula,
        embarcacion: formatResults[0].nomb_emb,
        fecha: `${formatResults[0].fecha_desc.substr(6,2)}/${formatResults[0].fecha_desc.substr(4,2)}/${formatResults[0].fecha_desc.substr(0,4)}`,
        planta: formatResults[0].planta_nombre
      };
      resultArray.push(data);
      id++;

      //Buscamos el turno previo y el turno siguiente
      // var resultQuery3 = await poolDBHana.executeQuery(turnoModel.queryTurnoPrevioSiguiente, [turno, planta, fecha, turno, planta, fecha]);
      var resultOdataTurnoPrevio= await oDataTurno.getTurnoPrevio({turno,planta,fecha})
      var formatResults= resultOdataTurnoPrevio.d.results.map(({ __metadata, ...rest }) => rest);
      
      for(var i=0; i < formatResults.length; i++){
          var data = {
            id:formatResults[i].correlativo,
            tipo:formatResults[i].tipo_turno,
            matricula: formatResults[i].matricula,
            embarcacion: formatResults[i].nomb_emb,
            fecha: `${formatResults[i].fecha_desc.substr(6,2)}/${formatResults[i].fecha_desc.substr(4,2)}/${formatResults[i].fecha_desc.substr(0,4)}`,
            planta: formatResults[i].planta_nombre
          };

          resultArray.push(data);
          id++;
      }

      //Buscamos el turno turnoActual
      // var resultQuery2 = await poolDBHana.executeQuery(turnoModel.queryTurnoActual, [planta, fecha]);
      var resultOdata= await oDataTurno.getTurnoActual({planta,fecha})
      var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);

      if(formatResults.length > 0){
        var data2 = {
          id:formatResults[0].correlativo,
          tipo:formatResults[0].tipo_turno,
          matricula: formatResults[0].matricula,
          embarcacion: formatResults[0].nomb_emb,
          fecha: `${formatResults[0].fecha_desc.substr(6,2)}/${formatResults[0].fecha_desc.substr(4,2)}/${formatResults[0].fecha_desc.substr(0,4)}`,
          planta: formatResults[0].planta_nombre
        };
        resultArray.push(data2);
        id++;
      }
    }
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultArray));
  } catch (exp) {
    console.log(exp);
    logger.error(exp);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, constants.MENSAJE.SERVIDOR.ERROR, null));
    return;
  }

});
exports.obtenerTurnoDescargaXMatricula = obtenerTurnoDescargaXMatricula;

var generarSolicitudTurnoDescarga = awaitErrorHandlerFactory(async (req, res, next) => {
  var { ambito, idMatricula, embarcacionMatricula, plantaId, latitude, longitude } = req.body;

  var token = req.headers.authorization.split(" ")[1];
  var resultToken = util.verifyJWTAuthToken(token);

  var data = {
    id                  : solicitudTurnoModel.sequelize.literal(`NEWID()`),
    ambito              : ambito,
    embarcacionId       : idMatricula,
    embarcacionMatricula: embarcacionMatricula,
    fechaSolicitud      : solicitudTurnoModel.sequelize.fn('GETDATE'),
    lat                 : latitude,
    lng                 : longitude,
    plantaId            : plantaId,
    estado              : 0,
    intento             : 0,
    username            : resultToken.username
  };

  var fechaActual = moment();
  
  var matricula2 = embarcacionMatricula;
  matricula2 = matricula2.substring(matricula2.indexOf("-")+1,matricula2.length);
  matricula2 = matricula2.substring(0, matricula2.indexOf("-"));

  //PASO 1: Validamos si las coordenadas de la embarcación estan dentro de una geocerca
  var [resultsIntersecta] = await solicitudTurnoModel.sequelize.query('EXEC [dbo].[SP_TURNO_EMBARCACION_VERFICAR_INTERSECTA_GEOM_MANUAL] :lat, :lng',
                                  {replacements: { lat: latitude, lng: longitude }});
  
  if(resultsIntersecta.length == 0){
    //Registramos el intento de solicitud de turno con estado 8 cuando no intersecta ninguna geocerca
    data.estado = 8;
    await solicitudTurnoModel.create(data);

    //Enviamos la respuesta
    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, `La embarcación con matrícula ${embarcacionMatricula} no se encuentra dentro de una zona de espera para descargar.`, null));
    return;
  }

  var plantaId = resultsIntersecta[0].plantaId;
  var fechaHanna = fechaActual.format('YYYYMMDD');
  //PASO 2. Verificamos si la matricula tiene turno activo para el día.
  // var resultQueryHanna = await poolDBHana.executeQuery(turnoModel.queryHANAEmbarcTieneTurno, [plantaId, fechaHanna, embarcacionMatricula]);
  var resultOdata=await oDataTurno.getEmbarcacionTurno({plantaId,fechaHanna,embarcacionMatricula})
  var formatResults=resultOdata.d.results.map(({ __metadata, ...rest }) => rest);

  if(formatResults.length > 0){
    //Registramos el intento de solicitud de turno con estado 9 cuando ya existe turno
    data.estado = 9;
    await solicitudTurnoModel.create(data);

    //Enviamos la respuesta
    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_DUPLICADO, `La embarcación con matrícula ${embarcacionMatricula} ya tiene un turno generado para el día de hoy. Contactar con el responsable de planta para mayor detalle.`, null));
    return;
  }

  var resultWSTurnoSAP = await hannaWSArmadores.registrarTurnoSAP(plantaId, matricula2, fechaHanna);
  if(resultWSTurnoSAP.RETURN !== "1"){
    logger.error(JSON.stringify(resultWSTurnoSAP));

    //Registramos el intento de solicitud de turno con estado 9 cuando no se pudo iniciar el turno en SAP.
    data.estado = 10;
    await solicitudTurnoModel.create(data);

    //Enviamos la respuesta
    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_DUPLICADO, `Disculpe las molestias, no se pudo generar el turno. Intentelo nuevamente o contactese con soporte.`, null));
    return;
  }

  //Registramos el intento de solicitud de turno con estado 8 cuando no intersecta ninguna geocerca
  data.estado = 2;
  await solicitudTurnoModel.create(data);
  res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, null));
  
});
exports.generarSolicitudTurnoDescarga = generarSolicitudTurnoDescarga;

var obtenerSolicitudTurnoDescarga = awaitErrorHandlerFactory(async (req, res, next) => {
  var pag    = util.getParamPageFromRequest(req);
  var regPag = util.getParamRegPagFromRequest(req);
  var offSet = util.calcularOffsetSqlServer(pag, regPag);

  var where = {};
  
  var result = await solicitudTurnoModel.findAndCountAll({
      where : where,
      offset: offSet,
      limit : regPag
  });

  res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.obtenerSolicitudTurnoDescarga = obtenerSolicitudTurnoDescarga;