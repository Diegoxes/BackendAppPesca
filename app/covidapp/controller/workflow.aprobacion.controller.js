'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const util = require('../../../util/util');
const constants = require('../../../config/constants');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const WorkflowAprobacionSapIds = require('../sequelize').WorkflowAprobacionSapIds;
const workflowAprobacionModel = require('../sequelize').WorkflowAprobacion;
const workflowAprobacionAprobadorModel = require('../sequelize').WorkflowAprobacionAprobador;
const WorkflowTemplateAprobador = require('../sequelize').WorkflowTemplateAprobador;
const TemporadaModel=require('../sequelize').Temporada;
const usuarioModel = require('../sequelize').Usuario;
const WorkflowTemplateModel=require('../sequelize').WorkflowTemplate;
const haydukMailer = require('../../../lib/hayduk_mailer/hayduk_mailer')
const ZFI_ARMADORES_RFC_SERV_SRV = require('../sap_odata/ZFI_ARMADORES_RFC_SERV_SRV')
const wsZFISV_ARM_SRV_SRV = require('../sap_odata/ZFISV_ARM_SRV_SRV')
const config = require('../../../config/config');
const utilWorkflowAprobacion = require('../../../util/utilWorkflowAprobacion');
const logger=require('../../../util/basic-logger');




var listWorkflowAprobaciones = awaitErrorHandlerFactory(async (req, res, next) => {
  var pag = util.getParamPageFromRequest(req);
  var regPag = util.getParamRegPagFromRequest(req);
  var offSet = util.calcularOffsetSqlServer(pag, regPag);

  var search = req.query.search;
  var año = req.query.fecha;

  var where = {};

  if (search) {
    where[Op.or] = [
      { id: { [Op.like]: '%' + search + '%' } },
      { nombre: { [Op.like]: '%' + search + '%' } }
    ];
  }

  if (año) {
    where[Op.and] = [
      sequelize.where(sequelize.fn('YEAR', sequelize.col('fecha')), año)
    ];
  }

  try {
    var result = await workflow_aprobacion.findAndCountAll({
      where: where,
      offset: offSet,
      limit: regPag
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
  } catch (error) {
    next(error);
  }
});

exports.listWorkflowAprobaciones = listWorkflowAprobaciones;

var getWorkflowAprobacion = awaitErrorHandlerFactory(async (req, res, next) => {
  var result = await workflowAprobacionModel.findOne({
    where: {
      id: req.params.id
    }
  });

  res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
});
exports.getWorkflowAprobacion = getWorkflowAprobacion;


const registerWorkflowAprobacion = async (req, res) => {
  try {
    const { nombre, data, detalle } = req.body;
    const workflowTemplateId = req.params.workflowTemplateId;

    if (!nombre || !data || !detalle || !workflowTemplateId) {
      return res.status(400).json({
        code: constants.CODIGO.CLIENTE.ERROR,
        mensaje: 'Faltan campos requeridos',
        data: null
      });
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

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultado));

  } catch (error) {
    res.status(500).json({
      code: constants.CODIGO.SERVIDOR.ERROR,
      mensaje: 'Error en el servidor',
      data: error.message
    });
  }
};

exports.registerWorkflowAprobacion = registerWorkflowAprobacion;

var listWorkflowAprobacionesInbox = awaitErrorHandlerFactory(async (req, res, next) => { // lista las solicitudes
  var pag = util.getParamPageFromRequest(req);
  var regPag = util.getParamRegPagFromRequest(req);
  var offSet = util.calcularOffsetSqlServer(pag, regPag);
  var token = req.headers.authorization.split(" ")[1];
  var resultToken = util.verifyJWTAuthToken(token);
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

  var result = await workflowAprobacionModel.findAndCountAll({
    where: where,
    offset: offSet,
    limit: regPag
  });

  res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));


});
exports.listWorkflowAprobacionesInbox = listWorkflowAprobacionesInbox;

const deleteWorkflowAprobacion = awaitErrorHandlerFactory(async (req, res, next) => {
  var { id } = req.params;
  var arrIds = id.split(",");

  var result = await workflowAprobacionModel.findAll({
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
      var resultDelete = await workflowAprobacionModel.destroy({
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
exports.deleteWorkflowAprobacion = deleteWorkflowAprobacion;


const assignApprovers = async (req, res) => {
  try {
    const { workflowAprobacionId, aprobadores } = req.body;

    for (const aprobador of aprobadores) {
      const workflowTemplateAprobador = await WorkflowTemplateAprobador.findOne({
        where: {
          id: aprobador.workflowTemplateAprobadorId,
        },
      });

      if (workflowTemplateAprobador) {
        await WorkflowAprobacionAprobador.create({
          workflowAprobacionId,
          workflowTemplateAprobadorId: workflowTemplateAprobador.id,
          usernameAprobador: aprobador.usernameAprobador,
          fecha: new Date(),
          detalle: aprobador.detalle || '',
          estado: 'PENDIENTE',
        });
      }
    }

    res.status(200).json({ message: 'Approvers assigned successfully' });
  } catch (error) {
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.assignApprovers = assignApprovers;


const obtenerWorkFlowAprobacionId = async (req, res, next) => {

  var id = req.params.id;

  try {
    var result = await workflowAprobacionModel.findOne({
      where: { id: id }
    });

    if (result) {
      res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
    } else {
      res.status(404).json(util.jsonResponse(constants.CODIGO.SERVIDOR.NO_ENCONTRADO, "Registro no encontrado", null));
    }
  } catch (error) {
    next(error);
  }
}

exports.obtenerWorkFlowAprobacionId = obtenerWorkFlowAprobacionId;

const obtenerSolicitudes = async (req, res) => {
  try {
    const { workflowTemplateId, username, fechaDesde, fechaHasta } = req.query;


    const filtros = {};

    if (workflowTemplateId) {
      filtros.workflowTemplateId = workflowTemplateId;
    }

    if (fechaDesde && fechaHasta) {
      filtros.fecha = {
        [Op.between]: [new Date(fechaDesde), new Date(fechaHasta)]
      };
    }

    const solicitudes = await WorkflowAprobacion.findAll({
      where: filtros,
      include: [
        {
          model: WorkflowAprobacionAprobador,
          as: 'aprobadores',
          required: username ? true : false,
          where: username ? { usernameAprobador: username } : {},
        }
      ]
    });
    res.status(200).json(solicitudes);
  } catch (error) {
    
    res.status(500).json({ message: 'Error al obtener solicitudes', error });
  }
};

exports.obtenerSolicitudes = obtenerSolicitudes;


const crearWorkflowAprobacionAprobador = async (req, res) => {
  try {

    const { workflowAprobacionId, workflowTemplateAprobadorId, usernameAprobador, detalle, estado } = req.body;

    const nuevoRegistro = await workflowAprobacionAprobadorModel.create({
      id: workflowAprobacionAprobadorModel.sequelize.literal(`NEWID()`),
      workflowAprobacionId,
      workflowTemplateAprobadorId,
      usernameAprobador,
      fecha: new Date(),
      detalle: detalle || '',
      estado: estado || 'PENDIENTE'
    });
    return res.status(201).json({
      success: true,
      message: 'Registro creado exitosamente.',
      data: nuevoRegistro
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error al crear el registro.',
      error: error.message
    });
  }
};

exports.crearWorkflowAprobacionAprobador = crearWorkflowAprobacionAprobador


async function obtenerAprobadorActual(workflowTemplateAprobadorId) {
  try {

    const aprobador = await WorkflowTemplateAprobador.findOne({
      where: { id: workflowTemplateAprobadorId }
    });

    if (!aprobador) {
      throw new Error('No se encontró el aprobador para el ID proporcionado.');
    }

    const aprobadorActual = aprobador.usernameDisabled ? aprobador.username2 : aprobador.username;

    return {
      aprobadorActual: aprobadorActual,
      esAprobadorSecundario: aprobador.usernameDisabled
    };

  } catch (error) {
    
    throw new Error('Error al obtener el aprobador actual.');
  }
}

exports.obtenerAprobadorActual = obtenerAprobadorActual


async function crearRegistroSapId(workflowAprobacionId, workflowTemplateId) {
  try {
    const nuevoRegistro = await WorkflowAprobacionSapIds.create({
      workflowAprobacionId,
      workflowTemplateId
    });

    return nuevoRegistro;
  } catch (error) {

    throw error;
  }
}

exports.crearRegistroSapId = crearRegistroSapId

const crearRegistroAprobacionAprobador = async (workflowAprobacionId, workflowTemplateAprobadorId, usernameAprobador, detalle, estado = 'Pendiente') => {
  console.log("INIT - crearRegistroAprobacionAprobador");
  try {

    const nuevoRegistro = await workflowAprobacionAprobadorModel.create({
      id: workflowAprobacionAprobadorModel.sequelize.literal(`NEWID()`),
      workflowAprobacionId,
      workflowTemplateAprobadorId,
      usernameAprobador,
      fecha: new Date(),
      detalle,
      estado
    });
    return {
      success: true,
      message: 'Registro creado exitosamente.',
      data: nuevoRegistro
    };
  } catch (error) {
    logger.error(JSON.stringify(error));
    return {
      success: false,
      message: 'Ocurrió un error al crear el registro.',
      error: error.message
    };
  }
}

exports.crearRegistroAprobacionAprobador = crearRegistroAprobacionAprobador


const sendAllEmailHaydukUsers = async (requestData,nameTemplateMail,typeFlow) => { //FUNCION DE ENVIO DE CORREOS PARA USUARIOS HAYDUK

  const usersArray=config.app.module.solicitudesWorkflowEmail.correos

  try {
    for (const user of usersArray) {
      const { userEmail,nombresApellidos} = user; 
      await sendEmailHaydukUsers(userEmail, requestData, nameTemplateMail, typeFlow,nombresApellidos);
    }
    
    return { success: true, message: 'Todos los correos fueron enviados con éxito.' };
  } catch (error) {
 
    throw new Error('Error al enviar correos a usuarios Hayduk');
  }
};

exports.sendAllEmailHaydukUsers=sendAllEmailHaydukUsers

const sendAllEmailHaydukUsersErrors = async (requestData,nameTemplateMail,typeFlow) => { //FUNCION DE ENVIO DE CORREOS ERRORES

  const usersArray=config.app.module.EmailForErrors.correosError

  try {
    for (const user of usersArray) {
      const { userEmail,nombresApellidos} = user; 
      await sendEmailHaydukUsers(userEmail, requestData, nameTemplateMail, typeFlow,nombresApellidos);
    }
    
    return { success: true, message: 'Todos los correos fueron enviados con éxito.' };
  } catch (error) {

    throw new Error('Error al enviar correos a aprobadores');
  }
};

exports.sendAllEmailHaydukUsersErrors=sendAllEmailHaydukUsersErrors



const findUser = async (username) => {

  const attributes = [
    'username',
    'nombresApellidos',

  ]
  const result = await usuarioModel.findOne({

    attributes: attributes,
    where: {
      username: username
    }
  })
  
  return result
}

exports.findUser=findUser



const searchApprovers = async (workflowTemplateId) => {

  const attributes = [
    'username',
    'usernameDisabled',
    'username2',
    'id',
    'nroAprobacion'
  ]

  const result = await WorkflowTemplateAprobador.findAll({
    attributes: attributes,
    where: {
      workflowTemplateId: workflowTemplateId
    }
  })

  return result
}

exports.searchApprovers = searchApprovers


const searchApproverOne = async (workflowTemplateId) => {

  const attributes = [
    'username',
    'usernameDisabled',
    'username2',
    'id',
    'nroAprobacion'
  ];

  const result = await WorkflowTemplateAprobador.findOne({
    attributes: attributes,
    where: {
      nroAprobacion: 1,
      workflowTemplateId: workflowTemplateId
    }
  });

  if (!result) {
    return null;
  }


  const username = result.usernameDisabled ? result.username2 : result.username;


  return {
    ...result.toJSON(),
    username
  };
};

exports.searchApproverOne = searchApproverOne;


const getDetallesForEmail = async (workflowAprobacionId) => {
  try {
    const solicitud = await workflowAprobacionModel.findOne({
      where: { id: workflowAprobacionId },
      attributes: ['detalle']  // Solo trae el campo detalle
    });
    if (!solicitud) {
      throw new Error('No se encontró ninguna solicitud con ese ID');
    }
    return solicitud.detalle;
  } catch (error) {
    throw error;
  }

}

exports.getDetallesForEmail = getDetallesForEmail;


// const verifyDecision = awaitErrorHandlerFactory(async (req, res) => {
//   const { username, workflowAprobacionId } = req.query;
//   if (!username || !workflowAprobacionId) {
//     return res.status(400).json({ success: false, error: 'Faltan parámetros' });
//   }
//   try {
   
//     const aprobador = await workflowAprobacionAprobadorModel.findOne({
//       where: {
//         workflowAprobacionId: workflowAprobacionId,
//         usernameAprobador: username,
//       },
//     });
//     if (!aprobador) {
//       return res.status(404).json({
//         success: false,
//         error: 'Aprobador no encontrado para la solicitud dada',
//       });
//     }

//     res.json({
//       success: true,
//       aprobador: {
//         username: aprobador.usernameAprobador,
//         estado: aprobador.estado,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Error interno del servidor' });
//   }
// });

// exports.verifyDecision = verifyDecision;

const verifyDecision = awaitErrorHandlerFactory(async (req, res) => {

  const { username, workflowAprobacionId } = req.query;

  if (!username || !workflowAprobacionId) {
    return res.status(400).json({ success: false, error: 'Faltan parámetros' });
  }

  try {
    const aprobador = await workflowAprobacionAprobadorModel.findOne({
      where: {
        workflowAprobacionId: workflowAprobacionId,
        usernameAprobador: username,
      },
    });

    if (!aprobador) {
      return res.status(404).json({
        success: false,
        error: 'Aprobador no encontrado para la solicitud dada',
      });
    }
    const solicitud = await workflowAprobacionModel.findOne({
      where: {
        id: workflowAprobacionId,
      },
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada',
      });
    }

    const { estado: estadoSolicitud } = solicitud;
    const { estado: estadoAprobador } = aprobador;

    if (
      (estadoSolicitud === 'AprobadaFinal' && estadoAprobador === 'Aprobada') ||
      estadoSolicitud === 'Rechazada'
    ) {
      return res.json({ success: false });
    }

    if (
      (estadoSolicitud === 'Pendiente' && estadoAprobador === 'Pendiente') ||
      (estadoSolicitud === 'En Aprobacion' && estadoAprobador === 'Pendiente')
    ) {
      
      return res.json({ success: true });
    }

    if (
      estadoSolicitud === 'En Aprobacion' && estadoAprobador === 'Aprobada'
    ) {
      
      return res.json({ success: false });
    }
    return res.json({ success: false });

  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

exports.verifyDecision = verifyDecision;



const actualizarEstadoWorkflowAprobacionAprobador = async (id, nuevoEstado) => {

  try {

    const updatedRows = await workflowAprobacionAprobadorModel.update(
      { estado: nuevoEstado },
      { where: { id } }
    );


    return { success: true, message: 'Estado actualizado con éxito' };
  } catch (error) {

    return { success: false, message: 'Error al actualizar el estado' };
  }
};

exports.actualizarEstadoWorkflowAprobacionAprobador = actualizarEstadoWorkflowAprobacionAprobador


const actualizarEstadoWorkflowAprobacion = async (id, nuevoEstado, detalleSap) => {
  
  try {

    const solicitud = await workflowAprobacionModel.findOne({ where: { id } });

    if (!solicitud) {
      return { success: false, message: 'No se encontró la solicitud con el ID proporcionado' };
    }

    const updateData = { estado: nuevoEstado };

    if (detalleSap) {
      updateData.detalle = detalleSap;
    }

    const [updatedRows] = await workflowAprobacionModel.update(
      updateData,
      { where: { id } }
    );

    if (updatedRows === 0) {
      return { success: false, message: 'No se actualizó la solicitud, puede que el estado sea el mismo o no haya cambios' };
    }

    return { success: true, message: 'Estado actualizado con éxito' };
  } catch (error) {
    return { success: false, message: 'Error al actualizar el estado' };
  }
};

exports.actualizarEstadoWorkflowAprobacion = actualizarEstadoWorkflowAprobacion


const countStateWorkflowAprobacion = async (req, res) => {
  try {

    const { codigoAdelanto, codigoHabilitacion } = req.query;

    if (!codigoAdelanto && !codigoHabilitacion) {
      return res.status(400).json({ message: 'Se requiere un código de adelanto o habilitación.' });
    }

    const filtro = codigoAdelanto
      ? { workflowTemplateId: codigoAdelanto }
      : { workflowTemplateId: codigoHabilitacion };

    const count = await workflowAprobacionModel.count({
      where: {
        ...filtro,
        estado: {
          [Op.or]: ['En Aprobacion', 'Pendiente']
        }
      }
    });

    return res.status(200).json({ count });
  } catch (error) {
 
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.countStateWorkflowAprobacion = countStateWorkflowAprobacion


const listWorflowAprobacionAH = async (req, res) => {

  var pag = util.getParamPageFromRequest(req);
  var regPag = util.getParamRegPagFromRequest(req);
  var offSet = util.calcularOffsetSqlServer(pag, regPag);
  var search = req.query.search;
  var año = req.query.fecha;
  const typeworkflowTemplateId = req.query.typeworkflowTemplateId;
  var where = {};

  if (search) {
    where[Op.or] = [
      { id: { [Op.like]: '%' + search + '%' } },
      { nombre: { [Op.like]: '%' + search + '%' } }
    ];
  }

  if (año) {
    where[Op.and] = [
      sequelize.where(sequelize.fn('YEAR', sequelize.col('fecha')), año)
    ];
  }

  if (typeworkflowTemplateId) {
    where.workflowTemplateId = typeworkflowTemplateId;
  }

  try {
    var result = await workflowAprobacionModel.findAndCountAll({
      where: where,
      offset: offSet,
      limit: regPag
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aprobaciones' })
  }
}

exports.listWorflowAprobacionAH = listWorflowAprobacionAH


const registrarHabilitacionAdelantoSapFinal = async (objData) => {

  try {

    const resultHeaderCSRFToken = await ZFI_ARMADORES_RFC_SERV_SRV.getCSRFToken();

    if (resultHeaderCSRFToken) {

      const result = await ZFI_ARMADORES_RFC_SERV_SRV.postAdelantoHabilitacion(resultHeaderCSRFToken, objData);
      logger.info(JSON.stringify(result));
      if (result) {
        return result;
      }
    } else {
      return { success: false, message: "No se pudo obtener el token CSRF." };
    }
  } catch (error) {

    return { success: false, message: `Error en la operación: ${error.message}` };
  }
};

exports.registrarHabilitacionAdelantoSapFinal = registrarHabilitacionAdelantoSapFinal;



const aprobarSolicitudHabilitacion = async (req, res) => {

  const { workflowAprobacionId, username } = req.body;

  const detalleforEmail = await getDetallesForEmail(workflowAprobacionId);
  const detalleObjeto = JSON.parse(detalleforEmail);
  detalleObjeto.sIdSolicitud=workflowAprobacionId

  if (!workflowAprobacionId || !username) {
    return res.status(400).json({ error: 'Faltan los parámetros necesarios en la solicitud' });
  }

  try {

    const workflowAprobacion1 = await workflowAprobacionModel.findByPk(workflowAprobacionId);

    if (!workflowAprobacion1) {
      return res.status(404).json({ error: 'No se encontró la solicitud de aprobación' });
    }

    const workflowTemplateId = workflowAprobacion1.workflowTemplateId;

    const aprobadores = await WorkflowTemplateAprobador.findAll({
      where: { workflowTemplateId },
      order: [['nroAprobacion', 'ASC']]
    });

    if (aprobadores.length === 0) {
      return res.status(404).json({ error: 'No se encontraron aprobadores para el template de flujo de trabajo' });
    }

    const aprobadorActual = aprobadores.find(aprobador => {
      if (aprobador.dataValues.usernameDisabled) {
        return aprobador.dataValues.username2 === username;
      }
      return aprobador.dataValues.username === username;
    });

    if (!aprobadorActual) {
      return res.status(403).json({ error: 'El usuario no es el aprobador actual' });
    }

    const nroDeAprobacionActual = aprobadorActual.nroAprobacion;

    const aprobadorActualRegistro = await workflowAprobacionAprobadorModel.findOne({
      where: { workflowAprobacionId, usernameAprobador: username }
    });

    if (!aprobadorActualRegistro) {

      return res.status(404).json({ error: 'No se encontró el registro del aprobador para esta solicitud' });
    }

    if (aprobadorActualRegistro.estado !== 'Pendiente') {
      return res.status(400).json({ error: 'El aprobador ya ha procesado esta solicitud' });
    }

    const siguienteAprobador = aprobadores.find(aprobador => aprobador.nroAprobacion === nroDeAprobacionActual + 1);
    logger.info(JSON.stringify(siguienteAprobador));
    if (siguienteAprobador) {
      
      const siguienteUsername = siguienteAprobador.usernameDisabled ? siguienteAprobador.username2 : siguienteAprobador.username;
      
      const usuario=await findUser(siguienteUsername)
      const {nombresApellidos}=usuario.dataValues
      detalleObjeto.aprobadorActual=nombresApellidos
      const detalleAprobadorActual=JSON.stringify(detalleObjeto)

      const resultEstadoH3=await actualizarEstadoHabilitacionSap(workflowAprobacionId, 3);
      if (!resultEstadoH3.success) {
        await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Habilitación")
        throw new Error(resultEstadoH3.message); 
      } else {
        await actualizarEstadoWorkflowAprobacionAprobador(aprobadorActualRegistro.id, 'Aprobada');
        await actualizarEstadoWorkflowAprobacion(workflowAprobacionId, 'En Aprobacion',detalleAprobadorActual);
        await crearRegistroAprobacionAprobador(
        workflowAprobacionId,
        siguienteAprobador.id,
        siguienteUsername,
        detalleforEmail,
        'Pendiente'
      );

      await sendApprovalEmail(`${siguienteUsername}`,detalleObjeto,"approval-request.html","Habilitación")
      }

    } else {
     
      const {nombresApellidos}=await findUser(aprobadorActual.dataValues.username)
      detalleObjeto.aprobadorActual=nombresApellidos
      
      const armadorEmail = detalleObjeto.sUser

      const resultEstadoH1=await actualizarEstadoHabilitacionSap(workflowAprobacionId, 1)
      if(!resultEstadoH1.success){
        await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Habilitación")
        throw new Error(resultEstadoH1.message);
      }else{

        try{
          const fechaForSap = await utilWorkflowAprobacion.obtenerFechaActualSap();
  
          const dataSap = {
            "IBldat": fechaForSap, //fecha
            "IStcd1": detalleObjeto.sIDRUC, //RUC
            "IBukrs": "HDKP", //FIJO
            "IEmbar": detalleObjeto.sEmbarcacion, //CODIDGO DE EMBARCACION 
            "IGsber": "H901",//FIJO
            "ITippr": "01",// HABILITACION
            "IWaers": detalleObjeto.sMoneda, //MONEDA
            "IWrbtr": detalleObjeto.sMontoSolicitado, //MONTO
          }
          const responseSap = await registrarHabilitacionAdelantoSapFinal(dataSap);
          logger.info(JSON.stringify(responseSap));
  
          if (!responseSap || !responseSap.IObjkey) {
            await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Habilitación")
        
            return res.status(500).json({ error: "IObjkey no fue recibido correctamente desde SAP. Proceso abortado." });  
          } 
          
          const{sDocumento,sSociedad,sAnio}=separarIObjkey(responseSap.IObjkey)
          
          detalleObjeto.IObjkey = responseSap.IObjkey;
          detalleObjeto.sDocumento=sDocumento;
          detalleObjeto.sSociedad=sSociedad;
          detalleObjeto.sAnio=sAnio;
    
          const detalleObjetoToString = JSON.stringify(detalleObjeto)
          
          await actualizarEstadoWorkflowAprobacionAprobador(aprobadorActualRegistro.id, 'Aprobada');
          await actualizarEstadoWorkflowAprobacion(workflowAprobacionId, 'AprobadaFinal', detalleObjetoToString);
          await sendAllEmailHaydukUsers(detalleObjeto,"accept-request.html","Habilitación")//CORREO encargados
          await sendAcceptEmail(`${armadorEmail}`,detalleObjeto,"accept-applicant.html","Habilitación")//CORREO solicitantes
    
        }catch(error){
          await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Habilitación")
        
          res.status(500).json({error:"Disculpa las molestias ocurrio un error:"})
            
          throw new Error("Ocurrió un error al actualizar el estado de la aprobación final.");
        }


      }
      
    }

    res.status(200).json({ message: 'Solicitud aprobada con éxito' });

  } catch (error) {
    await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Habilitación")

    res.status(500).json({ error: 'Error al procesar la solicitud de aprobación' });
  }
}

exports.aprobarSolicitudHabilitacion = aprobarSolicitudHabilitacion




// const actualizarEstadoHabilitacionSap = async (adelantoId, nuevoEstado) => {
  
//   try {
//     const estadosPermitidos = [1, 3, 9];
//     if (!estadosPermitidos.includes(nuevoEstado)) {
//       return { success: false, message: "Estado no válido." };
//     }
//     var resultSolicitudPendienteHabilitacion = await wsZFISV_ARM_SRV_SRV.getSolicitudPendienteHabilitacion(adelantoId);

//     if (resultSolicitudPendienteHabilitacion) {
//       const estadoActual = resultSolicitudPendienteHabilitacion['d:sEstado'];
//       if (estadosPermitidos.includes(nuevoEstado)) {

//         var dataObjeto = {};
//         Object.keys(resultSolicitudPendienteHabilitacion).forEach(key => {
//           let newKey1 = key.replace('d:', '');
//           dataObjeto[newKey1] = resultSolicitudPendienteHabilitacion[key];
//         });
//         if (nuevoEstado) {
//           dataObjeto['sEstado'] = nuevoEstado.toString();
//           switch (nuevoEstado) {
//             case 1:
//               dataObjeto['sEstadoDet'] = 'APROBADA';
//               break;
//             case 3:
//               dataObjeto['sEstadoDet'] = 'EN APROBACION';
//               break;
//             case 9:
//               dataObjeto['sEstadoDet'] = 'RECHAZADA';
//               break;
//             default:
//               dataObjeto['sEstadoDet'] = 'PENDIENTE';
//               break;
//           }
//         }

//         dataObjeto['dFechaActualiza'] = moment().format() + "Z";
//         dataObjeto['sID'] = dataObjeto['sID'].toString();
//         dataObjeto['sTasaDescuento'] = dataObjeto['sTasaDescuento'].toString();
//         dataObjeto['sCodHabilitacion'] = dataObjeto['sCodHabilitacion'].toString();
//         dataObjeto['sMontoSolicitado'] = dataObjeto['sMontoSolicitado'].toString();
//         dataObjeto['sIDRUC'] = dataObjeto['sIDRUC'].toString();
//         dataObjeto['sEstado'] = dataObjeto['sEstado'].toString();
//         dataObjeto['sDetalle'] = dataObjeto['sDetalle'].toString();
//         dataObjeto['sUsuarioActualiza'] = config.app.module.s4hana.username;

//         const resultHeaderCSRFToken = await wsZFISV_ARM_SRV_SRV.getCSRFToken('SolicitudPendAdelanto');

//         if (resultHeaderCSRFToken) {
//           const result = await wsZFISV_ARM_SRV_SRV.putSolicitudesPendientesHabilitacion(resultHeaderCSRFToken,adelantoId, dataObjeto);
//           logger.info(JSON.stringify(result));
//         } else {
//           return { success: false, message: "No se pudo obtener el token CSRF." };
//         }
//       }
//     }
//   } catch (error) {
//     return { success: false, message: "Error interno del servidor." };
//   }
// };

// exports.actualizarEstadoHabilitacionSap = actualizarEstadoHabilitacionSap;


const aprobarSolicitudAdelanto = async (req, res) => {

  const { workflowAprobacionId, username } = req.body;

  const detalleforEmail = await getDetallesForEmail(workflowAprobacionId);

  const detalleObjeto = JSON.parse(detalleforEmail)

  detalleObjeto.sIdSolicitud=workflowAprobacionId; 

  if (!workflowAprobacionId || !username) {
    return res.status(400).json({ error: 'Faltan los parámetros necesarios en la solicitud' });
  }

  try {
    const workflowAprobacion1 = await workflowAprobacionModel.findByPk(workflowAprobacionId);

    if (!workflowAprobacion1) {
      return res.status(404).json({ error: 'No se encontró la solicitud de aprobación' });
    }

    const workflowTemplateId = workflowAprobacion1.workflowTemplateId;

    const aprobadores = await WorkflowTemplateAprobador.findAll({
      where: { workflowTemplateId },
      order: [['nroAprobacion', 'ASC']]
    });

    if (aprobadores.length === 0) {
      return res.status(404).json({ error: 'No se encontraron aprobadores para el template de flujo de trabajo' });
    }

    const aprobadorActual = aprobadores.find(aprobador => {
     
      if (aprobador.dataValues.usernameDisabled) {
        return aprobador.dataValues.username2 === username;
      }
      return aprobador.dataValues.username === username;
    });


    if (!aprobadorActual) {
      return res.status(403).json({ error: 'El usuario no es el aprobador actual' });
    }

    const nroDeAprobacionActual = aprobadorActual.nroAprobacion;

    const aprobadorActualRegistro = await workflowAprobacionAprobadorModel.findOne({
      where: { workflowAprobacionId, usernameAprobador: username }
    });

    if (!aprobadorActualRegistro) {
      return res.status(404).json({ error: 'No se encontró el registro del aprobador para esta solicitud' });
    }

    if (aprobadorActualRegistro.estado !== 'Pendiente') {
      return res.status(400).json({ error: 'El aprobador ya ha procesado esta solicitud' });
    }

    const siguienteAprobador = aprobadores.find(aprobador => aprobador.nroAprobacion === nroDeAprobacionActual + 1);
    if (siguienteAprobador) {
      try{
      const siguienteUsername = siguienteAprobador.usernameDisabled ? siguienteAprobador.username2 : siguienteAprobador.username;
     
      const usuario=await findUser(siguienteUsername)
      const {nombresApellidos}=usuario.dataValues
      detalleObjeto.aprobadorActual=nombresApellidos

      const detalleAprobadorActual=JSON.stringify(detalleObjeto)
      const resultEstadoA3=await actualizarEstadoAdelantoSap(workflowAprobacionId, 3);

      if(!resultEstadoA3.success){
        await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Adelanto")
        throw new Error(resultEstadoA3.message);
      }else{
        await actualizarEstadoWorkflowAprobacionAprobador(aprobadorActualRegistro.id, 'Aprobada');
        await actualizarEstadoWorkflowAprobacion(workflowAprobacionId, 'En Aprobacion',detalleAprobadorActual);
        await crearRegistroAprobacionAprobador(
          workflowAprobacionId,
          siguienteAprobador.id,
          siguienteUsername,
          detalleforEmail,
          'Pendiente'
        );
        sendApprovalEmail(`${siguienteUsername}`,detalleObjeto,"approval-request.html","Adelanto")
      }
    }

      catch (error) {
        logger.error(`Error al procesar la aprobación del siguiente aprobador: ${error.message}`);
        throw new Error(`Ocurrió un error al crear el registro para el siguiente aprobador: ${error.message}`);
      }

    } else {
      
      const {nombresApellidos}=await findUser(aprobadorActual.dataValues.username);
      detalleObjeto.aprobadorActual=nombresApellidos

      const armadorEmail = detalleObjeto.sUser;

      const resultEstadoA1=await actualizarEstadoAdelantoSap(workflowAprobacionId, 1);

      if(!resultEstadoA1.success){
        await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Adelanto")
        throw new Error(resultEstadoA1.message);
      }else{

        try {
          const fechaForSap = await utilWorkflowAprobacion.obtenerFechaActualSap();
  
          const dataSap = {
            "IBldat": fechaForSap, //fecha
            "IStcd1": detalleObjeto.sIDRUC, //RUC
            "IBukrs": "HDKP", //FIJO
            "IEmbar": detalleObjeto.sEmbarcacion, //CODIGO DE EMBARCACION 
            "IGsber": "H901", //FIJO
            "ITippr": "03", 
            "IWaers": detalleObjeto.sMoneda, //MONEDA
            "IWrbtr": detalleObjeto.sMontoSolicitado, //MONTO
          };
          const responseSap = await registrarHabilitacionAdelantoSapFinal(dataSap);
          logger.info(JSON.stringify(responseSap));
         
  
          if (responseSap && responseSap.IObjkey) {
            detalleObjeto.IObjkey = responseSap.IObjkey;
            const {sDocumento,sAnio,sSociedad}=separarIObjkey(responseSap.IObjkey) 
  
            detalleObjeto.sDocumento=sDocumento
            detalleObjeto.sAnio=sAnio
            detalleObjeto.sSociedad=sSociedad    
  
          } else {
            await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Adelanto")
           
            return res.status(500).json({ error: "IObjkey no fue recibido correctamente desde SAP. Proceso abortado." });
          }
          
          const detalleObjetoToString = JSON.stringify(detalleObjeto);
  
          await actualizarEstadoWorkflowAprobacionAprobador(aprobadorActualRegistro.id, 'Aprobada');
          await actualizarEstadoWorkflowAprobacion(workflowAprobacionId, 'AprobadaFinal', detalleObjetoToString);
          await sendAcceptEmail(`${armadorEmail}`, detalleObjeto, "accept-applicant.html", "Adelanto");
          await sendAllEmailHaydukUsers(detalleObjeto, "accept-request.html", "Adelanto");
  
        } catch (error) {
          await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Adelanto")
       
          res.status(500).json({error:"Disculpa las molestias ocurrio un error:"})
            
          throw new Error("Ocurrió un error al actualizar el estado de la aprobación final.");
        }

      }
     
    }

    res.status(200).json({ message: 'Solicitud aprobada con éxito' });

  } catch (error) {

    res.status(500).json({ error: `Error al procesar la solicitud de aprobación: ${error.message}` });
  }
}


exports.aprobarSolicitudAdelanto = aprobarSolicitudAdelanto

// const actualizarEstadoAdelantoSap = async (adelantoId, nuevoEstado) => {

//   try {
//     const estadosPermitidos = [1, 3, 9];
//     if (!estadosPermitidos.includes(nuevoEstado)) {
//       return { success: false, message: "Estado no válido." };
//     }

//     var resultSolicitudPendienteA = await wsZFISV_ARM_SRV_SRV.getSolicitudPendienteAdelanto(adelantoId);
//     logger.info(JSON.stringify(resultSolicitudPendienteA));
//     if (resultSolicitudPendienteA) {
//       const estadoActual = resultSolicitudPendienteA['d:sEstado'];
      
//       if (estadosPermitidos.includes(nuevoEstado)) {

//         var dataObjeto = {};
//         Object.keys(resultSolicitudPendienteA).forEach(key => {
//           let newKey1 = key.replace('d:', '');
//           dataObjeto[newKey1] = resultSolicitudPendienteA[key];
//         });

//         if (nuevoEstado) {
//           dataObjeto['sEstado'] = nuevoEstado.toString();

//           switch (nuevoEstado) {
//             case 1:
//               dataObjeto['sEstadoDet'] = 'APROBADA';
//               break;
//             case 3:
//               dataObjeto['sEstadoDet'] = 'EN APROBACION';
//               break;
//             case 9:
//               dataObjeto['sEstadoDet'] = 'RECHAZADA';
//               break;
//             default:
//               dataObjeto['sEstadoDet'] = 'PENDIENTE';
//               break;
//           }
//         }

//         dataObjeto['dFechaActualiza'] = moment().format() + "Z";
//         dataObjeto['sID'] = dataObjeto['sID'].toString();
//         dataObjeto['sCodAdelanto'] = dataObjeto['sCodAdelanto'].toString();
//         dataObjeto['sMontoSolicitado'] = dataObjeto['sMontoSolicitado'].toString();
//         dataObjeto['sIDRUC'] = dataObjeto['sIDRUC'].toString();
//         dataObjeto['sEstado'] = dataObjeto['sEstado'].toString();
//         dataObjeto['sDetalle'] = dataObjeto['sDetalle'].toString(); 

//         dataObjeto['sUsuarioActualiza'] = config.app.module.s4hana.username;


//         const resultHeaderCSRFToken = await wsZFISV_ARM_SRV_SRV.getCSRFToken('SolicitudPendAdelanto');
//         if (resultHeaderCSRFToken) {
//           const result = await wsZFISV_ARM_SRV_SRV.putSolicitudesPendientesAdelanto(resultHeaderCSRFToken, adelantoId, dataObjeto);
//           logger.info(JSON.stringify(result));
          
//           if (result === true) {
//             return { success: true, message: "Estado actualizado con éxito." };
//           } else {
//             return { success: false, message: "Error al actualizar el estado." };
//           }
//         } else {
//           return { success: false, message: "No se pudo obtener el token CSRF." };
//         }
//       } else {
//         return { success: false, message: "El estado actual no permite modificaciones." };
//       }
//     } else {
//       return { success: false, message: "Solicitud no encontrada." };
//     }
//   } catch (error) {
  
 
//     return { success: false, message: "Error interno del servidor." };
//   }
// };

// exports.actualizarEstadoAdelantoSap = actualizarEstadoAdelantoSap

const rechazarSolicitudAdelanto = async (req, res) => {
  try {
    const { workflowAprobacionId, username } = req.body;

    const detalleforEmail = await getDetallesForEmail(workflowAprobacionId);
    const detalleObjeto = JSON.parse(detalleforEmail)
    detalleObjeto.sIdSolicitud=workflowAprobacionId;

    const aprobacionAprobador = await workflowAprobacionAprobadorModel.findOne({
      where: { workflowAprobacionId: workflowAprobacionId, usernameAprobador: username }
    });

    if (!aprobacionAprobador) {
      return res.status(404).json({ error: 'No se encontró al aprobador' });
    }

    if (aprobacionAprobador.dataValues.estado !== 'Pendiente') {
      return res.status(400).json({ error: 'Este aprobador ya ha procesado la solicitud anteriormente' });
    }

    const workflowAprobacion = await workflowAprobacionModel.findByPk(workflowAprobacionId);
    if (!workflowAprobacion) {
      return res.status(404).json({ error: 'No se encontró la solicitud de aprobación' });
    }

    const estadosPermitidos = ['Pendiente', 'En Aprobacion'];
    if (!estadosPermitidos.includes(workflowAprobacion.estado)) {
      return res.status(400).json({ error: `La solicitud no puede ser rechazada en el estado actual: ${workflowAprobacion.estado}` });
    }

    const resultEstadoA9 =await actualizarEstadoAdelantoSap(workflowAprobacionId, 9);
    if(!resultEstadoA9.success){
      await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Adelanto")
      return res.status(400).json({ error: `La solicitud no pudo se actualizada como rechazada` });
    }

    //Actualizamos el estado del aprobador de la solicitud
    aprobacionAprobador.estado = 'Rechazada';
    aprobacionAprobador.fecha = new Date();
    await aprobacionAprobador.save();

    //Actualizamos el estado de la solicitud
    workflowAprobacion.estado = 'Rechazada';
    await workflowAprobacion.save();

    const aprobadorReject1=aprobacionAprobador.usernameAprobador
    const aprobadorReject=await findUser(aprobadorReject1)
    const armadorEmail = detalleObjeto.sUser

    await sendRejectEmailArmador(`${armadorEmail}`, detalleObjeto,"reject-applicant.html","Adelanto")
    await sendAllEmailHaydukUsersRejectRequest(detalleObjeto,"reject-request.html","Adelanto",aprobadorReject)

    res.status(200).json({ message: 'Solicitud rechazada con éxito' });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

exports.rechazarSolicitudAdelanto = rechazarSolicitudAdelanto;


const rechazarSolicitudHabilitacion = async (req, res) => {
    try {
      const { workflowAprobacionId, username } = req.body;

      const detalleforEmail = await getDetallesForEmail(workflowAprobacionId);
      const detalleObjeto = JSON.parse(detalleforEmail)
      detalleObjeto.sIdSolicitud=workflowAprobacionId;

      const aprobacionAprobador = await workflowAprobacionAprobadorModel.findOne({
        where: { workflowAprobacionId: workflowAprobacionId, usernameAprobador: username }
      });

      if (!aprobacionAprobador) {
        return res.status(404).json({ error: 'No se encontró al aprobador' });
      }

      if (aprobacionAprobador.dataValues.estado !== 'Pendiente') {
        return res.status(400).json({ error: 'Este aprobador ya ha procesado la solicitud anteriormente' });
      }

      const workflowAprobacion = await workflowAprobacionModel.findByPk(workflowAprobacionId);
      if (!workflowAprobacion) {
        return res.status(404).json({ error: 'No se encontró la solicitud de aprobación' });
      }

      const estadosPermitidos = ['Pendiente', 'En Aprobacion'];
      if (!estadosPermitidos.includes(workflowAprobacion.estado)) {
        return res.status(400).json({ error: `La solicitud no puede ser rechazada en el estado actual: ${workflowAprobacion.estado}` });
      }

      const resultEstadoH9= await actualizarEstadoHabilitacionSap(workflowAprobacionId, 9);
      if(!resultEstadoH9.success){
        await sendAllEmailHaydukUsersErrors(detalleObjeto,"notify-error-workflow.html","Habilitación")
        return res.status(400).json({ error: `La solicitud no pudo se actualizada como rechazada` });
      }

      //Actualizamos el estado del aprobador de la solicitud
      aprobacionAprobador.estado = 'Rechazada';
      aprobacionAprobador.fecha = new Date();
      await aprobacionAprobador.save();

      //Actualizamos el estado de la solicitud
      workflowAprobacion.estado = 'Rechazada';
      await workflowAprobacion.save();

      const aprobadorReject1=aprobacionAprobador.usernameAprobador
      const aprobadorReject=await findUser(aprobadorReject1)
      const armadorEmail = detalleObjeto.sUser

      await sendRejectEmailArmador(`${armadorEmail}`, detalleObjeto,"reject-applicant.html","Habilitación")
      await sendAllEmailHaydukUsersRejectRequest(detalleObjeto,"reject-request.html","Habilitación",aprobadorReject)

      res.status(200).json({ message: 'Solicitud rechazada con éxito' });
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ error: 'Error interno del servidor' });
    }
}
exports.rechazarSolicitudHabilitacion = rechazarSolicitudHabilitacion;


const reporteWorflowAprobacionAH = async (req, res, next) => {
  const { embarcacion, planta, temporada } = req.query;

  try {

    const whereConditions = {
      estado: 'AprobadaFinal' 
    };

    const solicitudes = await workflowAprobacionModel.findAll({
      where: whereConditions
    });

    const solicitudesFiltradas = solicitudes.filter(solicitud => {
      let detalleJSON;
      try {
        detalleJSON = JSON.parse(solicitud.dataValues.detalle);
      } catch (error) {
        
        return false; 
      }
      const matchesEmbarcacion = embarcacion ? detalleJSON.sEmbarcacionDes.includes(embarcacion) : true;
      const matchesPlanta = planta ? detalleJSON.sPlanta === planta : true;
      const matchesTemporada = temporada ? detalleJSON.sTemporada === temporada : true;

      return matchesEmbarcacion && matchesPlanta && matchesTemporada;
    });

    res.json(solicitudesFiltradas); 
  } catch (error) {
  
    res.status(500).json({ message: 'Error al obtener las solicitudes' });
  }
};


exports.reporteWorflowAprobacionAH = reporteWorflowAprobacionAH;


function separarIObjkey(IObjkey) {
  const sociedad = "HDKP";
  const sociedadIndex = IObjkey.indexOf(sociedad);

  if (sociedadIndex === -1) {
    throw new Error('La sociedad HDKP no se encontró en el IObjkey');
  }

  const documento = IObjkey.slice(0, sociedadIndex);
  const anio = IObjkey.slice(sociedadIndex + sociedad.length);

  return {
    sDocumento: documento,
    sSociedad: sociedad,
    sAnio: anio
  };
}


const obtenerClavesPrimariasTemporada = async (req, res) => {
  try {
      
      const result = await TemporadaModel.findAll({
          attributes: ['temporada'] 
      });

      if (result.length === 0) {
          return res.status(200).json({
              message: 'No se encontraron temporadas.',
              data: []
          });
      }
      const clavesPrimarias = result.map(item => item.temporada);

      res.status(200).json({
          message: 'Claves primarias de temporadas encontradas.',
          data: clavesPrimarias
      });
  } catch (error) {
   
      res.status(500).json({
          message: 'Ocurrió un error al obtener las claves primarias.',
          error: error.message
      });
  }
};

exports.obtenerClavesPrimariasTemporada=obtenerClavesPrimariasTemporada



const obtenerSolicitudesFiltradas = async (req, res, next) => {
  try {
    const pag = req.query.pag ; 
    const regPag = parseInt(req.query.reg_pag, 10)
    const offSet = util.calcularOffsetSqlServer(pag, regPag); 
  
    let where = {};

    const workflowTemplateId = req.query.workflowTemplateId;

    if (workflowTemplateId && workflowTemplateId !== '') {
      where.workflowTemplateId = workflowTemplateId;  
    }

    
    const nombre = req.query.embarcacion;
    if (nombre && nombre !== '') {
      where.nombre = { [Op.like]: `%${nombre}%` }; 
    }

    const fechaInicio = req.query.fechaInicio;
    const fechaFin = req.query.fechaFin;


    if (fechaInicio && fechaFin) {
      where.fecha = {
        [Op.gte]: workflowAprobacionModel.sequelize.literal(`'${fechaInicio} 00:00:00'`), 
        [Op.lte]: workflowAprobacionModel.sequelize.literal(`'${fechaFin} 23:59:59'`)
      };
    }

    const result = await workflowAprobacionModel.findAndCountAll({
      where: where,
      offset: offSet,
      limit: regPag,
      order: [['fecha', 'DESC']] 
    });

    res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, result));
  } catch (error) {
  
    next(error);
  }
};

exports.obtenerSolicitudesFiltradas = obtenerSolicitudesFiltradas;


const obtenerTemplates = async (req, res) => {
  try {
    const templates = await WorkflowTemplateModel.findAll(); 
    return res.json(templates); 
  } catch (error) {
  
    res.status(500).send('Error del servidor'); 
  }
};

exports.obtenerTemplates = obtenerTemplates;

//correos

const sendApprovalEmail = async (approverEmail, requestData, nameTemplateMail, typeFlow) => { //funcion de correo para los aprobadores

  const dataUser = await findUser(approverEmail);

  const keysToInclude = [
    'dFechaRegistro',
    'sIdSolicitud',
    'sMontoSolicitado',
    'sPlanta',
    'sPlantaDes',
    'sEmbarcacion',
    'sEmbarcacionDes',
    'sRazonSocial',
    // 'sDetalle',
    'sIDRUC',
    'sArmador',
    // 'sEstadoDet',
    //'sEstado',
    //'sTask',
    //'sGroup',
    'sMoneda'
  ];

  if (!approverEmail || !requestData) {
    throw new Error('Email del aprobador y datos de solicitud son requeridos.');
  }

  try {

    const stringTableFormat = convertirJSON(requestData, keysToInclude)

    const replacements = {
      nombre: requestData.sArmador + requestData.sEmbarcacionDes,
      detalles: stringTableFormat,
      TipodeFlujo: typeFlow
    };

    const accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
    const type = 'html';
    const templateFileName = nameTemplateMail;
    const asunto = `[Pescando con Hayduk] - Solicitud de ${typeFlow} requiere su aprobación`;
    let mensajeHTML = await util.getEmailHtmlTemplate(templateFileName, replacements);
    const imageBinaryBuffer = util.getEmailLogo();

    mensajeHTML = mensajeHTML
      .replace(/{{detalles}}/g, replacements.detalles)
      .replace(/{{nombre}}/g, dataUser.nombresApellidos)
      .replace(/{{TipodeFlujo}}/g, replacements.TipodeFlujo);

    const attachments = [
      {
        filename: 'logo-email.png',
        value: imageBinaryBuffer
      }
    ];

    const resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
    const resultSendMail = await haydukMailer.sendEmail(
      accessTokenMail,
      config.email.username,
      approverEmail,
      type,
      asunto,
      mensajeHTML,
      null,
      null,
      resultAttachments
    );


    return { success: true, message: 'Correo enviado con éxito' };
  } catch (error) {
   
    throw new Error('Error al enviar el correo');
  }
};

exports.sendApprovalEmail = sendApprovalEmail;


const sendEmailHaydukUsers = async (approverEmail, requestData, nameTemplateMail, typeFlow,nombresApellidos) => { //funcion de correo para los aprobadores

  const keysToInclude = [
    'dFechaRegistro',
    'sIdSolicitud',
    'sMontoSolicitado',
    'sMoneda',
    'sPlantaDes',
    'sEmbarcacionDes',
    'sArmador',
    'IObjkey'
  ];

  if (!approverEmail || !requestData) {
    throw new Error('Email del aprobador y datos de solicitud son requeridos.');
  }

  try {

    const stringTableFormat = convertirJSON(requestData, keysToInclude)

    const replacements = {
      nombre: requestData.sArmador + requestData.sEmbarcacionDes,
      detalles: stringTableFormat,
      TipodeFlujo: typeFlow
    };

    const accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
    const type = 'html';
    const templateFileName = nameTemplateMail;
    const asunto = `[Pescando con Hayduk] - Nueva Solicitud de ${typeFlow} ${
      requestData.IObjkey && requestData.IObjkey.trim() !== '' ? 'aprobada' : 'registrada'}`;//cambiar aprobada y registrada
    let mensajeHTML =  util.getEmailHtmlTemplate(templateFileName, replacements);
    const imageBinaryBuffer = util.getEmailLogo();

    mensajeHTML = mensajeHTML
      .replace(/{{detalles}}/g, replacements.detalles)
      // .replace(/{{nombre}}/g, dataUser.nombresApellidos)
      .replace(/{{nombre}}/g, nombresApellidos)
      .replace(/{{TipodeFlujo}}/g, replacements.TipodeFlujo);

    const attachments = [
      {
        filename: 'logo-email.png',
        value: imageBinaryBuffer
      }
    ];

    const resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
    const resultSendMail = await haydukMailer.sendEmail(
      accessTokenMail,
      config.email.username,
      approverEmail,
      type,
      asunto,
      mensajeHTML,
      null,
      null,
      resultAttachments
    );
    return { success: true, message: 'Correo enviado con éxito' };
  } catch (error) {
  
    throw new Error('Error al enviar el correo');
  }
};

exports.sendEmailHaydukUsers = sendEmailHaydukUsers;


const sendApprovalEmailReject = async (email, requestData, nameTemplateMail, typeFlow,nombresApellidos,aprobadorReject) => { //CUANDO EL APROBADOR RECHAZE
 

  const keysToInclude = [
    'dFechaRegistro',
    'sIdSolicitud',
    'sMontoSolicitado',
    'sMoneda',
    'sPlantaDes',
    'sEmbarcacionDes',
    'sArmador',
  ];

  try {

    const stringTableFormat = convertirJSON(requestData, keysToInclude)

    const replacements = {
      nombre: requestData.sArmador + requestData.sEmbarcacionDes,
      nombreAprobador:aprobadorReject,
      detalles: stringTableFormat,
      TipodeFlujo: typeFlow
    };
    
    const accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
    const type = 'html';
    const templateFileName = nameTemplateMail;
    const asunto = `[Pescando con Hayduk] - Solicitud de ${typeFlow} - Rechazada`;
    let mensajeHTML =  util.getEmailHtmlTemplate(templateFileName, replacements);

    const imageBinaryBuffer = util.getEmailLogo();

    mensajeHTML = mensajeHTML
      .replace(/{{detalles}}/g, replacements.detalles)
      // .replace(/{{nombre}}/g, dataUser.nombresApellidos)
      .replace(/{{nombre}}/g,nombresApellidos)
      .replace(/{{nombreAprobador}}/g,replacements.nombreAprobador)
      .replace(/{{TipodeFlujo}}/g, replacements.TipodeFlujo);

    const attachments = [
      {
        filename: 'logo-email.png',
        value: imageBinaryBuffer
      }
    ];

    const resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
    const resultSendMail = await haydukMailer.sendEmail(
      accessTokenMail,
      config.email.username,
      email,
      type,
      asunto,
      //mensajeHTMLFinal,
      mensajeHTML,
      null,
      null,
      resultAttachments
    );
    return { success: true, message: 'Correo enviado con éxito' };
  } catch (error) {
    throw new Error('Error al enviar el correo');
  }
};

exports.sendApprovalEmailReject = sendApprovalEmailReject;




const convertirJSON = (jsonObject, keysToInclude) => {
  let table = '';
  for (const key of keysToInclude) {
    if (key === 'sID' || key === 'sMoneda') {
      continue;
    }
    let displayValue = jsonObject[key];

    if (key === 'sMontoSolicitado') {
      const moneda = jsonObject['sMoneda'] || 'No disponible';
      displayValue = `${displayValue} ${moneda}`;
    }

    const formattedKey = key.replace(/^[sd]/, '');

    displayValue = displayValue !== null && displayValue !== undefined ? displayValue : 'No disponible';

    table += `<strong>${formattedKey}:</strong> ${displayValue} <br>`;
  }

  return table;
}


const sendAllEmailHaydukUsersRejectRequest = async (requestData,nameTemplateMail,typeFlow,aprobadorReject) => { //FUNCION DE ENVIO DE CORREOSRECHAZO

  const usersArray=config.app.module.EmailForReject.correosRechazo
  
  try {
    for (const user of usersArray) {
      const { userEmail,nombresApellidos} = user; 
      await sendApprovalEmailReject(userEmail, requestData, nameTemplateMail, typeFlow,nombresApellidos,aprobadorReject.nombresApellidos);
    }
    
    return { success: true, message: 'Todos los correos fueron enviados con éxito.' };
  } catch (error) {
    throw new Error('Error al enviar correos a aprobadores');
  }
};

//correo armadores solicitantes

const sendRejectEmailArmador = async (email, requestData, nameTemplateMail, typeFlow) => {


  if (!email || !requestData || !nameTemplateMail || !typeFlow) {
    throw new Error('Email del aprobador y datos de solicitud son requeridos.');
  }


  const dataUser = await findUser(email);

  const commonKeys = [
    'sMontoSolicitado',
    'sEmbarcacionDes',
    'sArmador',
    'sMoneda'
  ];
  
  try {

    const stringTableFormat = convertirJSON(requestData, commonKeys)
    const replacements = {
      nombre: requestData.sArmador + requestData.sEmbarcacionDes,
      detalles: stringTableFormat,
      TipodeFlujo: typeFlow
    };

    const accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
    const type = 'html';
    const templateFileName = nameTemplateMail;
    const asunto = `[Pescando con Hayduk] - Solicitud de ${typeFlow} - Rechazada`;
    let mensajeHTML = await util.getEmailHtmlTemplate(templateFileName, replacements);
    const imageBinaryBuffer = util.getEmailLogo();

    mensajeHTML = mensajeHTML
      .replace(/{{detalles}}/g, replacements.detalles)
      .replace(/{{nombre}}/g, dataUser.nombresApellidos)
      .replace(/{{TipodeFlujo}}/g, replacements.TipodeFlujo);

    const attachments = [
      {
        filename: 'logo-email.png',
        value: imageBinaryBuffer
      }
    ];

    const resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
    const resultSendMail = await haydukMailer.sendEmail(
      accessTokenMail,
      config.email.username,
      email,
      type,
      asunto,
      mensajeHTML,
      null,
      null,
      resultAttachments
    );
   
    return { success: true, message: 'Correo enviado con éxito' };
  } catch (error) {
    throw new Error('Error al enviar el correo');
  }
};

exports.sendRejectEmailArmador = sendRejectEmailArmador;


const sendAcceptEmail = async (email, requestData, nameTemplateMail, typeFlow) => {

  if (!email || !requestData || !nameTemplateMail || !typeFlow) {
    throw new Error('Email del aprobador y datos de solicitud son requeridos.');
  }


  const dataUser = await findUser(email);

  const commonKeys = [
    'sMontoSolicitado',
    'sEmbarcacionDes',
    'sArmador',
    'sMoneda'
  ];
  
  try {

    const stringTableFormat = convertirJSON(requestData, commonKeys)
    const replacements = {
      nombre: requestData.sArmador + requestData.sEmbarcacionDes,
      detalles: stringTableFormat,
      TipodeFlujo: typeFlow
    };

    const accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
    const type = 'html';
    const templateFileName = nameTemplateMail;
    const asunto = `[Pescando con Hayduk] - Solicitud de ${typeFlow} - Aceptada`;
    let mensajeHTML = await util.getEmailHtmlTemplate(templateFileName, replacements);
    const imageBinaryBuffer = util.getEmailLogo();

    mensajeHTML = mensajeHTML
      .replace(/{{detalles}}/g, replacements.detalles)
      .replace(/{{nombre}}/g, dataUser.nombresApellidos)
      .replace(/{{TipodeFlujo}}/g, replacements.TipodeFlujo);

    const attachments = [
      {
        filename: 'logo-email.png',
        value: imageBinaryBuffer
      }
    ];

    const resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
    const resultSendMail = await haydukMailer.sendEmail(
      accessTokenMail,
      config.email.username,
      email,
      type,
      asunto,
      //mensajeHTMLFinal,
      mensajeHTML,
      null,
      null,
      resultAttachments
    );
   
    return { success: true, message: 'Correo enviado con éxito' };
  } catch (error) {
    
    throw new Error('Error al enviar el correo');
  }
};

exports.sendAcceptEmail = sendAcceptEmail;

const sendNotifyRequest = async (approverEmail, requestData, nameTemplateMail, typeFlow) => { //funcion de correo para los aprobadores

  const dataUser = await findUser(approverEmail);

  const keysToInclude = [
    'dFechaRegistro',
    'sIdSolicitud',
    'sMontoSolicitado',
    'sPlanta',
    'sPlantaDes',
    'sEmbarcacion',
    'sEmbarcacionDes',
    'sRazonSocial',
    // 'sDetalle',
    'sIDRUC',
    'sArmador',
    // 'sEstadoDet',
    //'sEstado',
    //'sTask',
    //'sGroup',
    'sMoneda'
  ];

  if (!approverEmail || !requestData) {
    throw new Error('Email del aprobador y datos de solicitud son requeridos.');
  }

  try {

    const stringTableFormat = convertirJSON(requestData, keysToInclude)

    const replacements = {
      nombre: requestData.sArmador + requestData.sEmbarcacionDes,
      detalles: stringTableFormat,
      TipodeFlujo: typeFlow
    };

    const accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
    const type = 'html';
    const templateFileName = nameTemplateMail;
    const asunto = `[Pescando con Hayduk] - Nueva Solicitud de ${typeFlow} registrada`;
    let mensajeHTML = await util.getEmailHtmlTemplate(templateFileName, replacements);
    const imageBinaryBuffer = util.getEmailLogo();

    mensajeHTML = mensajeHTML
      .replace(/{{detalles}}/g, replacements.detalles)
      .replace(/{{nombre}}/g, dataUser.nombresApellidos)
      .replace(/{{TipodeFlujo}}/g, replacements.TipodeFlujo);

    const attachments = [
      {
        filename: 'logo-email.png',
        value: imageBinaryBuffer
      }
    ];

    const resultAttachments = await haydukMailer.uploadAttachments(accessTokenMail, attachments);
    const resultSendMail = await haydukMailer.sendEmail(
      accessTokenMail,
      config.email.username,
      approverEmail,
      type,
      asunto,
      mensajeHTML,
      null,
      null,
      resultAttachments
    );


    return { success: true, message: 'Correo enviado con éxito' };
  } catch (error) {
   
    throw new Error('Error al enviar el correo');
  }
};

exports.sendNotifyRequest = sendNotifyRequest;


const clasificarSolicitudes = async (req, res) => {
  const { usernameAprobador, workflowTemplateId, page , pageSize , estado,search,fecha } = req.query;

  const pageNumber = parseInt(page, 10);
  const pageSizeNumber = parseInt(pageSize, 10);

  try {
   
    const whereCondition = {
      workflowTemplateId,
      ...(estado === 'Pendientes' && { estado: { [Op.in]: ['Pendiente', 'En Aprobacion'] } }),
      ...(estado === 'Aprobadas' && { estado: { [Op.in]: ['AprobadaFinal', 'En Aprobacion'] } }),
      ...(estado === 'Rechazadas' && { estado: 'Rechazada' }),
      ...(fecha && {
        [Op.and]: [
          { fecha: { [Op.gte]: new Date(`${año}-01-01`) } },
          { fecha: { [Op.lt]: new Date(`${parseInt(año) + 1}-01-01`) } }
        ]
      }),
      ...(search && {
        [Op.or]: [
          { id: search },
          { nombre: { [Op.like]: `%${search}%` } }
        ]
      })  
    };

    const { count, rows: solicitudes } = await workflowAprobacionModel.findAndCountAll({
      where: whereCondition,
      order: [['fecha', 'DESC']],
      limit: pageSizeNumber,
      offset: (pageNumber - 1) * pageSizeNumber,
    });
    
    const aprobadores = await workflowAprobacionAprobadorModel.findAll({
      where: {
        usernameAprobador,
      },
    });

    const Pendientes = [];
    const Aprobadas = [];
    const Rechazadas = [];


    solicitudes.forEach(solicitud => {
      const aprobadoresDeSolicitud = aprobadores.filter(a => a.workflowAprobacionId === solicitud.id);

      const esPendiente = aprobadoresDeSolicitud.some(aprobador => aprobador.estado === 'Pendiente');
      const esAprobada = aprobadoresDeSolicitud.some(aprobador => aprobador.estado === 'Aprobada');
      const esRechazada = aprobadoresDeSolicitud.some(aprobador => aprobador.estado === 'Rechazada');

      if (esPendiente) {
        Pendientes.push(solicitud);
      } else if (solicitud.estado === 'AprobadaFinal' || (solicitud.estado === 'En Aprobacion' && esAprobada)) {
        Aprobadas.push(solicitud); 
      } else if (esRechazada) {
        Rechazadas.push(solicitud);
      }
    });

    res.json({
      solicitudes: {
        Pendientes,
        Aprobadas,
        Rechazadas,
      },
      totalItems: {
        totalPendientes: Pendientes.length,
        totalAprobadas: Aprobadas.length,
        totalRechazadas: Rechazadas.length,
      },
      totalCount: count,
      page: pageNumber,
      pageSize: pageSizeNumber,
      solicitudesFiltradas:solicitudes
    });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al clasificar las solicitudes.' });
  }
};

exports.clasificarSolicitudes = clasificarSolicitudes;


const countRequestForUser = async (req, res) => {
  const { usernameAprobador, workflowTemplateId } = req.query;

  try {
    const aprobadores = await workflowAprobacionAprobadorModel.findAll({
      where: {
        usernameAprobador,
      },
    });

    const solicitudes = await workflowAprobacionModel.findAll({
      where: {
        workflowTemplateId,
        
      },
    });

    let totalPendientes = 0;
    let totalAprobadas = 0;
    let totalRechazadas = 0;

    solicitudes.forEach(solicitud => {
      const aprobadoresDeSolicitud = aprobadores.filter(a => a.workflowAprobacionId === solicitud.id);
      
      const esPendiente = aprobadoresDeSolicitud.some(aprobador => aprobador.estado === 'Pendiente');
      const esAprobada = aprobadoresDeSolicitud.some(aprobador => aprobador.estado === 'Aprobada');
      const esRechazada = aprobadoresDeSolicitud.some(aprobador => aprobador.estado === 'Rechazada');
    
      if ((solicitud.estado === 'En Aprobacion' && esPendiente) || (solicitud.estado === 'Pendiente' && esPendiente)) {
        totalPendientes++;
      } else if (solicitud.estado === 'AprobadaFinal' || (solicitud.estado === 'En Aprobacion' && esAprobada)) {
        totalAprobadas++;
      } else if (esRechazada) {
        totalRechazadas++;
      }
    });

    res.json({
      totalItems: {
        totalPendientes,
        totalAprobadas,
        totalRechazadas,
      },
    });
  } catch (error) {
    console.error('Error al clasificar las solicitudes:', error);
    res.status(500).json({ error: 'Ocurrió un error al clasificar las solicitudes.' });
  }
};

exports.countRequestForUser  = countRequestForUser ;


//separar logica para paginado 
const getBandejaPendientes=async(req,res)=>{

    const {usernameAprobador,workflowTemplateId,page,pageSize}=req.query

    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);

  
    const aprobadoresPendientes = await workflowAprobacionAprobadorModel.findAll({
      where: {
        usernameAprobador,
        estado: 'Pendiente'
      },
    });
  
    const idsPendientes = aprobadoresPendientes.map(aprobador => aprobador.workflowAprobacionId);
    const totalSolicitudesPendientes = await workflowAprobacionModel.count({
      where: {
        id: { [Op.in]: idsPendientes },
        workflowTemplateId,
        estado: { [Op.in]: ['Pendiente', 'En Aprobacion'] }
      },
    });
  
    const solicitudesPendientes= await workflowAprobacionModel.findAll({
      where: {
        id: { [Op.in]: idsPendientes },
        workflowTemplateId,
        estado: { [Op.in]: ['Pendiente', 'En Aprobacion'] }
      },
      order: [['fecha', 'DESC']],
      limit: 120,
      // offset: (pageNumber - 1) * pageSizeNumber,
    });

    res.json({solicitudesPendientes:solicitudesPendientes,totalSolicitudesPendientes:totalSolicitudesPendientes})
  
}

exports.getBandejaPendientes=getBandejaPendientes


const getBandejaAprobadas=async(req,res)=>{

  const {usernameAprobador,workflowTemplateId,page,pageSize}=req.query

  const pageNumber = parseInt(page, 10);
  const pageSizeNumber = parseInt(pageSize, 10);


  const aprobadoresAprobados = await workflowAprobacionAprobadorModel.findAll({
    where: {
      usernameAprobador,
      estado: 'Aprobada'
    },
  });

  const idsAprobados = aprobadoresAprobados.map(aprobador => aprobador.workflowAprobacionId);

  const solicitudesAprobadas= await workflowAprobacionModel.findAll({
    where: {
      id: { [Op.in]: idsAprobados },
      workflowTemplateId,
      estado: { [Op.in]: ['AprobadaFinal', 'En Aprobacion'] }
    },
    order: [['fecha', 'DESC']],
    limit: 120,
    // offset: (pageNumber - 1) * pageSizeNumber,
  });

  const totalSolicitudesAprobadas = await workflowAprobacionModel.count({
    where: {
      id: { [Op.in]: idsAprobados },
      workflowTemplateId,
      estado: { [Op.in]: ['AprobadaFinal', 'En Aprobacion'] }
    },
  });

  res.json({solicitudesAprobadas:solicitudesAprobadas,totalSolicitudesAprobadas:totalSolicitudesAprobadas})

}

exports.getBandejaAprobadas=getBandejaAprobadas


const getBandejaRechazadas=async(req,res)=>{
  const {usernameAprobador,workflowTemplateId,page,pageSize}=req.query
  const pageNumber = parseInt(page, 10);
  const pageSizeNumber = parseInt(pageSize, 10);

  const aprobadoresRechazados = await workflowAprobacionAprobadorModel.findAll({
    where: {
      usernameAprobador,
      estado: 'Rechazada'
    },
  });

  const idsRechazados = aprobadoresRechazados.map(aprobador => aprobador.workflowAprobacionId);

  const solicitudesRechazadas= await workflowAprobacionModel.findAll({
    where: {
      id: { [Op.in]: idsRechazados },
      workflowTemplateId,
      estado: 'Rechazada'
    },
    order: [['fecha', 'DESC']],
    limit: 100,
    // offset: (pageNumber - 1) * pageSizeNumber,
  });

  const totalSolicitudesRechazadas = await workflowAprobacionModel.count({
    where: {
      id: { [Op.in]: idsRechazados },
      workflowTemplateId,
      estado: 'Rechazada'
    },
  });

  res.json({solicitudesRechazadas:solicitudesRechazadas,totalSolicitudesRechazadas:totalSolicitudesRechazadas})
}


exports.getBandejaRechazadas=getBandejaRechazadas

const getBandejadeSolicitudesFiltradas=async(req,res)=>{
  const { workflowTemplateId, fecha, search,estado } = req.query;

  try {
   
    const whereCondition = {
      ...(workflowTemplateId ? { workflowTemplateId } : {}),
      ...(fecha ? {
        fecha: {
          [Op.gte]: new Date(`${fecha}-01-01`),
          [Op.lt]: new Date(`${parseInt(fecha) + 1}-01-01`)
        }
      } : {}),
      ...(search && search !== 'null' ? { 
        [Op.or]: [
          { id: search },
          { nombre: { [Op.like]: `%${search}%` } }
        ]
      } : {}),
      ...(estado ? {
        estado: estado === 'Aprobada' ? { [Op.or]: ['Aprobada', 'En Aprobacion'] } : estado
      } : {})
    };

    const { count, rows: solicitudes } = await workflowAprobacionModel.findAndCountAll({
      where: whereCondition,
      order: [['fecha', 'DESC']],
    });

    res.json({
      solicitudes,

    });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener las solicitudes.' });
  }
}

exports.getBandejadeSolicitudesFiltradas=getBandejadeSolicitudesFiltradas


const actualizarEstadoHabilitacionSap = async (habilitacionId, nuevoEstado) => {
  const estadosPermitidos = [1, 3, 9];
  if (!estadosPermitidos.includes(nuevoEstado)) {
    return { success: false, message: "Estado no válido." };
  }
  
  const intentarActualizar = async (id) => {
    var resultSolicitudPendienteHabilitacion = await wsZFISV_ARM_SRV_SRV.getSolicitudPendienteHabilitacion(id);

    if (resultSolicitudPendienteHabilitacion) {
      const estadoActual = resultSolicitudPendienteHabilitacion['d:sEstado'];
      if (estadosPermitidos.includes(nuevoEstado)) {
        var dataObjeto = {};
        Object.keys(resultSolicitudPendienteHabilitacion).forEach(key => {
          let newKey1 = key.replace('d:', '');
          dataObjeto[newKey1] = resultSolicitudPendienteHabilitacion[key];
        });
        if (nuevoEstado) {
          dataObjeto['sEstado'] = nuevoEstado.toString();
          switch (nuevoEstado) {
            case 1:
              dataObjeto['sEstadoDet'] = 'APROBADA';
              break;
            case 3:
              dataObjeto['sEstadoDet'] = 'EN APROBACION';
              break;
            case 9:
              dataObjeto['sEstadoDet'] = 'RECHAZADA';
              break;
            default:
              dataObjeto['sEstadoDet'] = 'PENDIENTE';
              break;
          }
        }

        dataObjeto['dFechaActualiza'] = moment().format() + "Z";
        dataObjeto['sID'] = dataObjeto['sID'].toString();
        dataObjeto['sTasaDescuento'] = dataObjeto['sTasaDescuento'].toString();
        dataObjeto['sCodHabilitacion'] = dataObjeto['sCodHabilitacion'].toString();
        dataObjeto['sMontoSolicitado'] = dataObjeto['sMontoSolicitado'].toString();
        dataObjeto['sIDRUC'] = dataObjeto['sIDRUC'].toString();
        dataObjeto['sEstado'] = dataObjeto['sEstado'].toString();
        dataObjeto['sDetalle'] = dataObjeto['sDetalle'].toString();
        dataObjeto['sUsuarioActualiza'] = config.app.module.s4hana.username;

        const resultHeaderCSRFToken = await wsZFISV_ARM_SRV_SRV.getCSRFToken('SolicitudPendAdelanto');

        if (resultHeaderCSRFToken) {
          const result = await wsZFISV_ARM_SRV_SRV.putSolicitudesPendientesHabilitacion(resultHeaderCSRFToken, id, dataObjeto);
          console.log("UPDATE resultHeaderCSRFToken = ", result);
          logger.info(JSON.stringify(result));

          if (result === true) {
            return { success: true, message: "Estado actualizado con éxito." };
          } else {
            return { success: false, message: "Error al actualizar el estado." };
          }
        } else {
          return { success: false, message: "No se pudo obtener el token CSRF." };
        }
      }
    }
    return { success: false, message: "No se encontró la solicitud." };
  };

  try {
    //Actualización con Lower CASE
    let result = await intentarActualizar(habilitacionId.toLowerCase());
    return result;

  } catch (errorLower) {
    logger.error(JSON.stringify(errorLower.message));

    //Si falla lowercase intenemaos actualizar con UPPER CASE
    try{
      let result2 = await intentarActualizar(habilitacionId);
      return result2;
    }catch(errorUpper){
      logger.error(JSON.stringify(errorUpper.message));
      return { success: false, message: "Error interno del servidor." };
    }
  }
};

exports.actualizarEstadoHabilitacionSap = actualizarEstadoHabilitacionSap;


const actualizarEstadoAdelantoSap = async (adelantoId, nuevoEstado) => {

  const estadosPermitidos = [1, 3, 9];
  if (!estadosPermitidos.includes(nuevoEstado)) {
    return { success: false, message: "Estado no válido." };
  }

  const intentarActualizar = async (id) => {
    var resultSolicitudPendienteA = await wsZFISV_ARM_SRV_SRV.getSolicitudPendienteAdelanto(id);
    logger.info(JSON.stringify(resultSolicitudPendienteA));
    
    if (resultSolicitudPendienteA) {
      const estadoActual = resultSolicitudPendienteA['d:sEstado'];
      
      if (estadosPermitidos.includes(nuevoEstado)) {

        var dataObjeto = {};
        Object.keys(resultSolicitudPendienteA).forEach(key => {
          let newKey1 = key.replace('d:', '');
          dataObjeto[newKey1] = resultSolicitudPendienteA[key];
        });

        if (nuevoEstado) {
          dataObjeto['sEstado'] = nuevoEstado.toString();

          switch (nuevoEstado) {
            case 1:
              dataObjeto['sEstadoDet'] = 'APROBADA';
              break;
            case 3:
              dataObjeto['sEstadoDet'] = 'EN APROBACION';
              break;
            case 9:
              dataObjeto['sEstadoDet'] = 'RECHAZADA';
              break;
            default:
              dataObjeto['sEstadoDet'] = 'PENDIENTE';
              break;
          }
        }

        dataObjeto['dFechaActualiza'] = moment().format() + "Z";
        dataObjeto['sID'] = dataObjeto['sID'].toString();
        dataObjeto['sCodAdelanto'] = dataObjeto['sCodAdelanto'].toString();
        dataObjeto['sMontoSolicitado'] = dataObjeto['sMontoSolicitado'].toString();
        dataObjeto['sIDRUC'] = dataObjeto['sIDRUC'].toString();
        dataObjeto['sEstado'] = dataObjeto['sEstado'].toString();
        dataObjeto['sDetalle'] = dataObjeto['sDetalle'].toString(); 

        dataObjeto['sUsuarioActualiza'] = config.app.module.s4hana.username;

        const resultHeaderCSRFToken = await wsZFISV_ARM_SRV_SRV.getCSRFToken('SolicitudPendAdelanto');
        if (resultHeaderCSRFToken) {
          const result = await wsZFISV_ARM_SRV_SRV.putSolicitudesPendientesAdelanto(resultHeaderCSRFToken, id, dataObjeto);
          logger.info(JSON.stringify(result));

          if (result === true) {
            return { success: true, message: "Estado actualizado con éxito." };
          } else {
            return { success: false, message: "Error al actualizar el estado." };
          }
        } else {
          return { success: false, message: "No se pudo obtener el token CSRF." };
        }
      } else {
        return { success: false, message: "El estado actual no permite modificaciones." };
      }
    } else {
      return { success: false, message: "Solicitud no encontrada." };
    }
  };

  try {
    //Actualización con Lower CASE
    let result = await intentarActualizar(adelantoId.toLowerCase());
    return result;

  } catch (errorLower) {
    logger.error(JSON.stringify(errorLower.message));

    //Si falla lowercase intenemaos actualizar con UPPER CASE
    try{
      let result2 = await intentarActualizar(adelantoId);
      return result2;
    }catch(errorUpper){
      logger.error(JSON.stringify(errorUpper.message));
      return { success: false, message: "Error interno del servidor." };
    }
  }
};

exports.actualizarEstadoAdelantoSap = actualizarEstadoAdelantoSap;