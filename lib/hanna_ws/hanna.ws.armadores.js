var soap = require("soap");
var url = "http://10.0.0.10/extranetws/armadores.asmx?WSDL";
var config = require('../../config/config');

module.exports = {
  actualizarTurnoSAP: function (matricula, nroTolva) {
    var args = {
      NUM_MATR: matricula,
      TOLVA: nroTolva,
    };

    return new Promise(function (resolve, reject) {
      soap.createClient(url, function (err, client) {
        if(config.production){
          client.ACTUALIZA_TURNO_APP(args, function (err, result) {
            resolve(result.ACTUALIZA_TURNO_APPResult);
          });
        }else{
          client.ACTUALIZA_TURNO_APP_QAS(args, function (err, result) {
            resolve(result.ACTUALIZA_TURNO_APP_QASResult);
          });
        }
        
      });
    });
  },
  registrarTurnoSAP: function (planta, matricula, fecha) {
    return new Promise(function (resolve, reject) {
      var args = {
        WERKS:planta,
        NUM_MATR: matricula,
        FECHA_DESC: fecha,
      };

      soap.createClient(url, function (err, client) {
        if(config.production){
          client.CREA_TURNO_APP(args, function (err, result) {
            console.log("hanna.ws.armadores", "registrarTurnoSAP","CREA_TURNO_APP", result);
            resolve(result.CREA_TURNO_APPResult);
          });
        }else{
          client.CREA_TURNO_APP_QAS(args, function (err, result) {
            console.log("hanna.ws.armadores", "registrarTurnoSAP","CREA_TURNO_APP_QAS", result);
            resolve(result.CREA_TURNO_APP_QASResult);
          });
        }
      });
    });
  },
};
