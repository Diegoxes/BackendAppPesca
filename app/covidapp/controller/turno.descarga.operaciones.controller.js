'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const poolDBHana = require('../../../db/connectionDBHana');
const logger = require('../../../util/basic-logger');
const config = require('../../../config/config');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const seguridadController = require("./seguridad.controller");

const turnoModel = require('../../hanna/model/turno.model');
const odataTurno=require('../sap_odata/ZCDSPM_004_CDS_TURNO')

var obtenerTurnoDescargaXPlanta = awaitErrorHandlerFactory(async (req, res, next) => {
  var arrModulosIds = ['covidapp-operaciones-turnoDescarga'];

  if (!await seguridadController.validarAccesoUsuarioModulo(req, res, false, arrModulosIds)) {
    return;
  }

  var planta = req.params.planta;
  var fechaDescarga = req.params.fecha;
  try {
    var resultArray = [];
    var id=1;
    //Obtenemos mi turno... si no hay turno no continuamos
    // var queryTurnoPlanta = turnoModel.queryTurnoPlanta.replace('@codPlanta',planta).replace('@fechaDescarga',fechaDescarga);
    var odataTurnoPlanta=  await odataTurno.getTurnoPlanta({planta,fechaDescarga})
    var formatResults=odataTurnoPlanta.d.results.map(({ __metadata, ...rest }) => rest);

    // var resultQuery1 = await poolDBHana.executeQuery(queryTurnoPlanta, []);
    for(var i=0; i < formatResults.length; i++){
      var data = {
        id:formatResults[i].correlativo,
        tipo:formatResults[i].tipo_turno,
        matricula: formatResults[i].matricula,
        embarcacion: formatResults[i].nomb_emb,
        fecha: `${formatResults[i].fecha_desc.substr(6,2)}/${formatResults[i].fecha_desc.substr(4,2)}/${formatResults[i].fecha_desc.substr(0,4)}`,
        planta: formatResults[i].PLANTA_NOMBRE,
        turno: formatResults[i].turno,
        estado: formatResults[i].estado,
      };

      resultArray.push(data);
      id++;
    }
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultArray));
  } catch (exp) {
    console.log(exp);
    logger.error(exp);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.ERROR, constants.MENSAJE.SERVIDOR.ERROR, null));
    return;
  }

});
exports.obtenerTurnoDescargaXPlanta = obtenerTurnoDescargaXPlanta;
