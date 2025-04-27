'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');
const config = require('../../../config/config');
const logger = require('../../../util/basic-logger');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const ocrTicketTolvaPescaModel = require('../sequelize').OcrTicketTolvaPesca;

var listTicketTolvaOCR = awaitErrorHandlerFactory(async (req, res, next) => {
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var informeFlota = req.query.informeFlota;
    var matricula = req.query.matricula;

    var where = null;
    if (informeFlota) {
        where = { informeFlota: { [Op.like]: '%' + informeFlota + '%' } }
    }
    if (matricula) {
        where = { nroMatricula: { [Op.like]: '%' + matricula + '%' } }
    }

    var result = await ocrTicketTolvaPescaModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag,
        order:[
          ['ticketFecha','DESC']
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listTicketTolvaOCR = listTicketTolvaOCR;

var getTicketTolvaOCR = awaitErrorHandlerFactory(async (req, res, next) => {
    var result = await ocrTicketTolvaPescaModel.findOne({
        where: {
            id: req.params.id
        }
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getTicketTolvaOCR = getTicketTolvaOCR;

var addTicketTolvaOCR = awaitErrorHandlerFactory(async (req, res, next) => {
    var { planta, fechaHoraInicio, fechaHoraFin, matricula, especie, nroPesadas, pesoAcumulado, nroTolva, nroReporte, informeFlota } = req.body;

    var plantasTecnipesa = {
      'H101':'0002',
      'H102':'0003',
      'H105':'0006',
    };

    var data = {
        plantaId:plantasTecnipesa[planta],
        fechaHoraInicio: ocrTicketTolvaPescaModel.sequelize.literal(`'${fechaHoraInicio}'`),
        fechaHoraFin: ocrTicketTolvaPescaModel.sequelize.literal(`'${fechaHoraFin}'`),
        nroMatricula: matricula,
        especie:especie,
        nroPesadas:nroPesadas,
        pesoAcumulado:pesoAcumulado,
        nroTolva:nroTolva,
        nroReporte:nroReporte,
        informeFlota:informeFlota
    };

    var resultAdd = await ocrTicketTolvaPescaModel.create(data);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultAdd));
});
exports.addTicketTolvaOCR = addTicketTolvaOCR;

var editTicketTolvaOCR = awaitErrorHandlerFactory(async (req, res, next) => {
  var {  nroPesadas, pesoAcumulado } = req.body;

    var data = {
      nroPesadas:nroPesadas,
      pesoAcumulado:pesoAcumulado
    };

    var result = await ocrTicketTolvaPescaModel.findOne({
        where: {
            id: req.params.id
        }
    });

    if (result) {
        var resultUpdate = await result.update(data);
        res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultUpdate));
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.editTicketTolvaOCR = editTicketTolvaOCR;

var deleteTicketTolvaOCR = awaitErrorHandlerFactory(async (req, res, next) => {
    var { id } = req.params;
    var arrIds = id.split(",");

    //Obtenemos los Ids finales a eliminar
    var result = await ocrTicketTolvaPescaModel.findAll({
        where: {
            id: arrIds
        }
    });

    if (result) {
        var arrIdsFinal = [];
        for (var i = 0; i < result.length; i++) {
            arrIdsFinal.push(result[i].id);
        }

        if (arrIdsFinal.length > 0) {
            var resultDelete = await ocrTicketTolvaPescaModel.destroy({
                where: {
                    id: arrIdsFinal
                }
            });
            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultDelete));
        } else {
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));
        }
        return;
    }

    res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
    res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, constants.MENSAJE.APLICACION.ERROR_REGISTRO_NO_ENCONTRADO, null));

});
exports.deleteTicketTolvaOCR = deleteTicketTolvaOCR;
