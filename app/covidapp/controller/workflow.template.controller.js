'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');
const uuidv4 = require('uuid').v4;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const workflowTemplateModel = require('../sequelize').WorkflowTemplate;
const workflowTemplateAprobadorModel =require('../sequelize').WorkflowTemplateAprobador;
const workflowAprobacionModel = require('../sequelize').WorkflowAprobacion;
const usuarioModel = require('../sequelize').Usuario;

var listWorkflowTemplates = awaitErrorHandlerFactory(async (req, res, next) => {
    var pag = util.getParamPageFromRequest(req);
    var regPag = util.getParamRegPagFromRequest(req);
    var offSet = util.calcularOffsetSqlServer(pag, regPag);

    var search = req.query.search;

    var where = null;
    if (search) {
        where = {
            [Op.or]: [
                { id: { [Op.like]: '%' + search + '%' } },
                { nombre: { [Op.like]: '%' + search + '%' } }
            ]
        };
    }

    var result = await workflowTemplateModel.findAndCountAll({
        where: where,
        offset: offSet,
        limit: regPag
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listWorkflowTemplates = listWorkflowTemplates;

var getWorkflowTemplate = awaitErrorHandlerFactory(async (req, res, next) => {
    var result = await workflowTemplateModel.findOne({
        where: {
            id: req.params.id
        }
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getWorkflowTemplate = getWorkflowTemplate;

var addWorkflowTemplate = awaitErrorHandlerFactory(async (req, res, next) => {
    var { nombre, descripcion } = req.body;

    var data = {
        id: workflowTemplateModel.sequelize.literal(`NEWID()`),
        nombre,
        descripcion
    };


    var resultAdd = await workflowTemplateModel.create(data);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultAdd));
    return;
});
exports.addWorkflowTemplate = addWorkflowTemplate;

var editWorkflowTemplate = awaitErrorHandlerFactory(async (req, res, next) => {
    var { nombre, descripcion } = req.body;

    var data = {
        nombre,
        descripcion
    };

    var result = await workflowTemplateModel.findOne({
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

exports.editWorkflowTemplate = editWorkflowTemplate;

var deleteWorkflowTemplate = awaitErrorHandlerFactory(async (req, res, next) => {
    var { id } = req.params;
    var arrIds = id.split(",");

    //Obtenemos los Ids finales a eliminar
    var result = await workflowTemplateModel.findAll({
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
            var resultDelete = await workflowTemplateModel.destroy({
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
exports.deleteWorkflowTemplate = deleteWorkflowTemplate;


//TEMPLATE APROBADORES


var listWorkflowTemplateAprobadores = awaitErrorHandlerFactory(async (req, res, next) => {
    var workflowTemplateId = req.params.workflowTemplateId;

    var where = {
        workflowTemplateId:workflowTemplateId
    };

    var result = await workflowTemplateAprobadorModel.findAll({
        where: where,
        include: [
            {   attributes:[
                    'username',
                    'nombresApellidos'
                ],
                model: usuarioModel, 
                as: 'usuarioAprobador' 
            },
            { 
                attributes:[
                    'username',
                    'nombresApellidos'
                ],
                model: usuarioModel, 
                as: 'usuarioAprobador2' 
            },
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.listWorkflowTemplateAprobadores = listWorkflowTemplateAprobadores;


var getWorkflowTemplateAprobador = awaitErrorHandlerFactory(async (req, res, next) => {
    var result = await workflowTemplateAprobadorModel.findOne({
        where: {
            id: req.params.id,
            workflowTemplateId:req.params.workflowTemplateId
        },
        include: [
            {   attributes:[
                    'username',  //busca por username
                    'nombresApellidos'
                ],
                model: usuarioModel, 
                as: 'usuarioAprobador' 
            },
            { 
                attributes:[
                    'username',
                    'nombresApellidos'
                ],
                model: usuarioModel, 
                as: 'usuarioAprobador2' 
            },
        ]
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});

exports.getWorkflowTemplateAprobador = getWorkflowTemplateAprobador;

var addWorkflowTemplateAprobador = awaitErrorHandlerFactory(async (req, res, next) => {
    var { nroAprobacion, username, usernameDisabled, 
        username2, aprobacionFinal, funcionAprobacionFinalScript, funcionRechazoScript, 
        estadoAprobado, estadoRechazado } = req.body;

    var data = {
        id: workflowTemplateModel.sequelize.literal(`NEWID()`),
        workflowTemplateId:req.params.workflowTemplateId,
        nroAprobacion, 
        username, 
        usernameDisabled, 
        username2, 
        aprobacionFinal, 
        funcionAprobacionFinalScript, 
        funcionRechazoScript, 
        estadoAprobado,
        estadoRechazado
    };


    var resultAdd = await workflowTemplateAprobadorModel.create(data);
    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultAdd));
    return;
});
exports.addWorkflowTemplateAprobador = addWorkflowTemplateAprobador;

var editWorkflowTemplateAprobador = awaitErrorHandlerFactory(async (req, res, next) => {
    var {  nroAprobacion, username, usernameDisabled, 
        username2, aprobacionFinal, funcionAprobacionFinalScript, funcionRechazoScript, 
        estadoAprobado, estadoRechazado } = req.body;

    var data = {
        nroAprobacion, 
        username, 
        usernameDisabled, 
        username2, 
        aprobacionFinal, 
        funcionAprobacionFinalScript, 
        funcionRechazoScript, 
        estadoAprobado, 
        estadoRechazado
    };

    var result = await workflowTemplateAprobadorModel.findOne({
        where: {
            id: req.params.id,
            workflowTemplateId:req.params.workflowTemplateId
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
exports.editWorkflowTemplateAprobador = editWorkflowTemplateAprobador;

var deleteWorkflowTemplateAprobador = awaitErrorHandlerFactory(async (req, res, next) => {
    var { id, workflowTemplateId } = req.params;
    var arrIds = id.split(",");

    //Obtenemos los Ids finales a eliminar
    var result = await workflowTemplateAprobadorModel.findAll({
        where: {
            id: arrIds,
            workflowTemplateId:workflowTemplateId
        }
    });

    if (result) {
        var arrIdsFinal = [];
        for (var i = 0; i < result.length; i++) {
            arrIdsFinal.push(result[i].id);
        }

        if (arrIdsFinal.length > 0) {
            var resultDelete = await workflowTemplateAprobadorModel.destroy({
                where: {
                    id: arrIdsFinal,
                    workflowTemplateId:workflowTemplateId
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

exports.deleteWorkflowTemplateAprobador = deleteWorkflowTemplateAprobador;

const findWorkflowTemplateAprobadorById = async (id) => {
    try {
      const workflowTemplateAprobador = await workflowTemplateAprobadorModel.findOne({
        where: { id }
      });
  
      // Verifica si se encontró un registro
      if (!workflowTemplateAprobador) {
        return { success: false, message: 'Registro no encontrado.' };
      }
  
      // Devuelve el registro encontrado
      return { success: true, data: workflowTemplateAprobador };
    } catch (error) {
      // Maneja cualquier error que ocurra durante la búsqueda
      console.error('Error al buscar el registro:', error);
      return { success: false, message: 'Ocurrió un error al buscar el registro.', error: error.message };
    }
  };

  exports.findWorkflowTemplateAprobadorById=findWorkflowTemplateAprobadorById


  const crearWorkFlowAprobacion = async (workflowTemplateId, { nombre, data, detalle }) => {
    
    try {
      if (!nombre || !data || !detalle || !workflowTemplateId) {
        throw new Error('Faltan campos requeridos');
      }
      const newRequest = {
        id: uuidv4(),
        workflowTemplateId, 
        fecha: new Date(),
        nombre,
        data,
        detalle,
        estado: "Pendiente"
      };
      const resultado = await workflowAprobacionModel.create(newRequest);
  
      return {
        success: true,
        data: resultado
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  exports.crearWorkFlowAprobacion=crearWorkFlowAprobacion
  