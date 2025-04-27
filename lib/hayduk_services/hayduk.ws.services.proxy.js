var soap = require("soap");
var config = require('../../config/config');

const { XMLParser, XMLBuilder } = require("fast-xml-parser");


module.exports = {
  onlineRecovery: function (ruc, tipoDoc, folio, tipoRetorno, login, clave) {
    var args = {
        ruc: ruc,
        tipoDoc: tipoDoc,
        folio: folio,
        tipoRetorno: tipoRetorno,
        login: login,
        clave: clave
    };

    return new Promise(function (resolve, reject) {
      soap.createClient(config.app.module.haydukServicesProxy.url, function (err, client) {
        client.OnlineRecovery(args, function (err, result) {
            const parser = new XMLParser();
            let jObj = parser.parse(result.OnlineRecoveryResult);
            resolve(jObj.Respuesta);
        });
      });
    });
  }
};
