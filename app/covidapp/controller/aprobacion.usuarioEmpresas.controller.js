const UsuarioEmpresasModel=require('../sequelize').UsuarioEmpresas
const WorkflowAprobacionAprobadorUsuarioEmpresas=require('../sequelize').WorkflowAprobacionAprobadorUsuarioEmpresasModel
const usuarioModel = require('../sequelize').Usuario;
const moment = require('moment');
const { rows } = require('mssql');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const haydukMailer = require('../../../lib/hayduk_mailer/hayduk_mailer')
const config = require('../../../config/config');
const util = require('../../../util/util');
const constants = require('../../../config/constants');
const WorkflowTemplateAprobador = require('../sequelize').WorkflowTemplateAprobador;


const createUserCompany=async(ruc,razonSocial,username)=>{
  try {
    const usuarioDatos = await usuarioModel.findOne({
      where: { username: username }
    })

    const detallesUsuario={
      nombresApellidos:usuarioDatos.dataValues.nombresApellidos,
      telefono:usuarioDatos.dataValues.telefono,
      correo:usuarioDatos.dataValues.username
    }
    
    const usuarioDatosString=JSON.stringify(detallesUsuario)
  
    const newUserCompany = await UsuarioEmpresasModel.create({
      username,
      razonSocial,
      ruc,
      estado: "Pendiente",
      favorita: false,
      detalles:usuarioDatosString,
      fecha: new Date(),
    });

    return  newUserCompany ;

  } catch (error) {
    console.error('Error al crear la empresa:', error);
    
  }
}

exports.createUserCompany=createUserCompany

const updateUserCompanyStatus = async (id,estado) => {
    try {
    
      const userCompany = await UsuarioEmpresasModel.findByPk(id);
  
      if (!userCompany) {
        return res.status(404).json({ message: 'Empresa no encontrada' });
      }
  
      userCompany.estado = estado;
      await userCompany.save();
  
      return{
        message: 'Estado de la empresa actualizado a activada',
        data: userCompany
      }
    } catch (error) {

    }
  };
  
exports.updateUserCompanyStatus = updateUserCompanyStatus;

const searchApproverOneTemplateUsuarioEmpresas = async () => {

    const attributes = [
      'username',
      'usernamedisabled',
      'username2',
      'id',
      'nroAprobacion'
    ];
  
    const result = await WorkflowTemplateAprobador.findOne({
      attributes: attributes,
      where: {
        workflowTemplateId:"060C7EC1-50F4-4421-9EF0-8688F3D5B273",
        nroAprobacion: 1,
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
  
  exports.searchApproverOneTemplateUsuarioEmpresas = searchApproverOneTemplateUsuarioEmpresas;

  
const createUsuarioEmpresas=async(req,res)=>{ 
    
    const {ruc,razonSocial,username}=req.body

    const newUserCompany=await createUserCompany(ruc,razonSocial,username)

    const getFirstApproverUsuarioEmpresas=await  searchApproverOneTemplateUsuarioEmpresas();
    const usernameAprobador=getFirstApproverUsuarioEmpresas.username;
    
    const worflowAprobacionUsuarioEmpresasId=newUserCompany.dataValues.id

    await createAprobadorUsuarioEmpresas(worflowAprobacionUsuarioEmpresasId,usernameAprobador)
    return res.status(200).json({
      message: 'La empresa y su aprobador se crearon exitosamente.',
    });
}   

exports.createUsuarioEmpresas=createUsuarioEmpresas;



async function createAprobadorUsuarioEmpresas(worflowAprobacionUsuarioEmpresasId,usernameAprobador) {
    try {
        const newRecord = await WorkflowAprobacionAprobadorUsuarioEmpresas.create({
            worflowAprobacionUsuarioEmpresasId: worflowAprobacionUsuarioEmpresasId,
            usernameAprobador:usernameAprobador,
            fecha: new Date(), 
            detalle: "data",
            estado: "Pendiente", 
        });
        
       
        return newRecord;
    } catch (error) {
        console.error('Error al crear el registro de aprobador:', error);
        throw error; 
    }
}



const aprobarSolicitudUsuarioEmpresas=async(req,res)=>{

    const { worflowAprobacionUsuarioEmpresasId, username,detalle } = req.body;
    // const detalleObjeto=JSON.parse(detalle)

    if (!worflowAprobacionUsuarioEmpresasId || !username) {

    return res.status(400).json({ error: 'Faltan los parámetros necesarios en la solicitud' });
  }

  try {

     const workflowAprobacionUsuarioEmpresa = await UsuarioEmpresasModel.findByPk(worflowAprobacionUsuarioEmpresasId);

    if (!workflowAprobacionUsuarioEmpresa) {
      return res.status(404).json({ error: 'No se encontró la solicitud de aprobación' });
    }

    const workflowTemplateUsuarioEmpresasId = workflowAprobacionUsuarioEmpresa.workflowTemplateUsuarioEmpresasId;

    const aprobadores = await WorkflowTemplateAprobador.findAll({
      where:{
        workflowTemplateId:"060C7EC1-50F4-4421-9EF0-8688F3D5B273"
      },
      order: [['nroAprobacion', 'ASC']]
    });
    
    if (aprobadores.length === 0) {
      return res.status(404).json({ error: 'No se encontraron aprobadores para el template de flujo de trabajo' });
    }

    const aprobadorActual = aprobadores.find(aprobador => {
      if (aprobador.usernamedisabled) {
        return aprobador.username2 === username;
      }
      return aprobador.username === username;
    });

    if (!aprobadorActual) {
      return res.status(403).json({ error: 'El usuario no es el aprobador actual' });
    }

    const nroDeAprobacionActual = aprobadorActual.nroAprobacion;

    const aprobadorActualRegistro = await WorkflowAprobacionAprobadorUsuarioEmpresas.findOne({
      where: { worflowAprobacionUsuarioEmpresasId,usernameAprobador: username }
    });

    

    if (!aprobadorActualRegistro) {

      return res.status(404).json({ error: 'No se encontró el registro del aprobador para esta solicitud' });
    }

    if (aprobadorActualRegistro.estado !== 'Pendiente') {
     
      return res.status(400).json({ error: 'El aprobador ya ha procesado esta solicitud' });
    }

    await actualizarEstadoUsuarioEmpresasAprobacionAprobador(worflowAprobacionUsuarioEmpresasId, 'Aprobada');
   
    const siguienteAprobador = aprobadores.find(aprobador => aprobador.nroAprobacion === nroDeAprobacionActual + 1);

    if (siguienteAprobador) {

    const siguienteUsername = siguienteAprobador.usernameDisabled ? siguienteAprobador.username2 : siguienteAprobador.username;

    await updateUserCompanyStatus(worflowAprobacionUsuarioEmpresasId,"En Aprobacion")
    await createAprobadorUsuarioEmpresas(worflowAprobacionUsuarioEmpresasId,siguienteUsername)

    } else {
     
        const correoArmador=workflowAprobacionUsuarioEmpresa.username
        await updateUserCompanyStatus(worflowAprobacionUsuarioEmpresasId,"Aprobada")
        await sendApprovalUserEmpresas(correoArmador,"usuarioempresas-accept-request.html",workflowAprobacionUsuarioEmpresa)
    }

    res.status(200).json({ message: 'Solicitud aprobada con éxito' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error al procesar la solicitud de aprobación: ${error.message}` });
  }

}

exports.aprobarSolicitudUsuarioEmpresas=aprobarSolicitudUsuarioEmpresas;

const rechazarSolicitudUsuarioEmpresas=async(req,res)=>{
  try {
    const { worflowAprobacionUsuarioEmpresasId, username } = req.body;

    const aprobacionAprobador = await WorkflowAprobacionAprobadorUsuarioEmpresas.findOne({
      where: { worflowAprobacionUsuarioEmpresasId: worflowAprobacionUsuarioEmpresasId, usernameAprobador: username }
    });

    if (!aprobacionAprobador) {

      return res.status(404).json({ error: 'No se encontró al aprobador' });
    }

    if (aprobacionAprobador.estado !== 'Pendiente') {
      return res.status(400).json({ error: 'Este aprobador ya ha procesado la solicitud anteriormente' });
    }

    const workflowAprobacion = await UsuarioEmpresasModel.findByPk(worflowAprobacionUsuarioEmpresasId);

    if (!workflowAprobacion) {
      return res.status(404).json({ error: 'No se encontró la solicitud de aprobación' });
    }

    const estadosPermitidos = ['Pendiente', 'En Aprobacion'];
    if (!estadosPermitidos.includes(workflowAprobacion.estado)) {
      return res.status(400).json({ error: `La solicitud no puede ser rechazada en el estado actual: ${workflowAprobacion.estado}` });
    }

    aprobacionAprobador.estado = 'Rechazada';

    

    aprobacionAprobador.fecha = new Date();
    
    await aprobacionAprobador.save();

    if (workflowAprobacion) {

      workflowAprobacion.estado = 'Rechazada';
      await workflowAprobacion.save();
    
    }

    res.status(200).json({ message: 'Solicitud rechazada con éxito' });
  } catch (error) {

    res.status(500).json({ error: 'Error interno del servidor' });
  }

} 

exports.rechazarSolicitudUsuarioEmpresas=rechazarSolicitudUsuarioEmpresas


const actualizarEstadoUsuarioEmpresasAprobacionAprobador = async (id, nuevoEstado) => {
  try {
    const registro = await WorkflowAprobacionAprobadorUsuarioEmpresas.findOne({
      where: { worflowAprobacionUsuarioEmpresasId:id }
    });

    if (!registro) {
      return { message: "Registro no encontrado", success: false };
    }

    registro.estado = nuevoEstado;
    registro.updatedAt = new Date(); 
    await registro.save();

    return { message: "Estado actualizado correctamente", success: true };
  } catch (error) {
    return { message: "Error al actualizar el estado", success: false };
  }
};

const clasificarSolicitudesUsuarioEmpresas = async (req, res) => {
  const { usernameAprobador, pag , pageSize , estado } = req.query;

  // const pageNumber = parseInt(pag, 10);
  // const pageSizeNumber = parseInt(pageSize, 10);

  try {
   
    const whereCondition = {
      ...(estado === 'Pendientes' && { estado: { [Op.in]: ['Pendiente', 'En Aprobacion'] } }),
      ...(estado === 'Aprobadas' && { estado: { [Op.in]: ['Aprobada', 'En Aprobacion'] } }),
      ...(estado === 'Rechazadas' && { estado: 'Rechazada' }),
    };

    const {  rows: solicitudes } = await UsuarioEmpresasModel.findAndCountAll({
      where: whereCondition,
      order: [['fecha', 'DESC']],
      // limit: pageSizeNumber,
      // offset: (pageNumber - 1) * pageSizeNumber,
    });

    const aprobadores = await WorkflowAprobacionAprobadorUsuarioEmpresas.findAll({
      where: {
        usernameAprobador,
      },
    });

    const PendientesUsuarioEmpresas = [];
    const AprobadasUsuarioEmpresas = [];
    const RechazadasUsuarioEmpresas = [];


    solicitudes.forEach(solicitud => {
      const aprobadoresDeSolicitud = aprobadores.filter(a => a.worflowAprobacionUsuarioEmpresasId === solicitud.id);

      const esPendiente = aprobadoresDeSolicitud.some(aprobador => aprobador.estado === 'Pendiente');
      const esAprobada = aprobadoresDeSolicitud.some(aprobador => aprobador.estado === 'Aprobada');
      const esRechazada = aprobadoresDeSolicitud.some(aprobador => aprobador.estado === 'Rechazada');

      if (esPendiente) {
        PendientesUsuarioEmpresas.push(solicitud);
      } else if (solicitud.estado === 'Aprobada' || (solicitud.estado === 'En Aprobacion' && esAprobada)) {
        AprobadasUsuarioEmpresas.push(solicitud); 
      } else if (esRechazada) {
        RechazadasUsuarioEmpresas.push(solicitud);
      }
    });

    const numPendientes=PendientesUsuarioEmpresas.length
    res.json({
      solicitudes: {
        PendientesUsuarioEmpresas,
        AprobadasUsuarioEmpresas,
        RechazadasUsuarioEmpresas,
        numPendientes
      },
      // page: pageNumber,
      // pageSize: pageSizeNumber,
    });
  } catch (error) {
    console.error("Error al clasificar solicitudes:", error); 
    res.status(500).json({ error: 'Ocurrió un error al clasificar las solicitudes.' });
  }
};

exports.clasificarSolicitudesUsuarioEmpresas= clasificarSolicitudesUsuarioEmpresas;


const getUsuarioEmpresasForUsername=async(req,res)=>{
  const{username} = req.query;

  try {
    const registros = await UsuarioEmpresasModel.findAll({
        where: {
            username: username,
            estado: {
              [Op.in]: ['Aprobada', 'En Aprobacion', 'Pendiente']
            }
        },
        order: [
          [Sequelize.literal(`CASE 
            WHEN estado = 'Aprobada' THEN 1 
            WHEN estado = 'En Aprobacion' THEN 2 
            WHEN estado = 'Pendiente' THEN 3 
            ELSE 4 END`), 'ASC'],
          ['fecha', 'DESC']
        
        ],
    });
    res.json(registros); 
} catch (error) {
    console.error('Error al obtener registros:', error);
    throw error; 
}
} 
exports.getUsuarioEmpresasForUsername=getUsuarioEmpresasForUsername



const getRequestForReport = async (req, res) => {

  try {
    
    const { fechaInicio, fechaFin, username, estado } = req.query;

    let filters = {};

    if (fechaInicio) {
      filters.fecha = { [Op.gte]: new Date(fechaInicio) };
    }

    if (fechaFin) {
      if (!filters.fecha) {
        filters.fecha = {};
      }
      filters.fecha[Op.lte] = new Date(fechaFin);
    }

    if (username) {
      filters.username = { [Op.like]: `%${username}%` };
    }

    if (estado) {
      filters.estado = estado;
    }

    
    const solicitudes = await UsuarioEmpresasModel.findAll({
      where: filters,
    });

    res.json({ success: true, data: solicitudes });
  } catch (error) {
    console.error('Error al obtener las solicitudes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las solicitudes.' });
  }
};

exports.getRequestForReport=getRequestForReport;



const verifyDecisionUsuarioEmpresas = async (req, res) => {

  const { username, workflowAprobacionId } = req.query;

  if (!username || !workflowAprobacionId) {
    return res.status(400).json({ success: false, error: 'Faltan parámetros' });
  }

  try {
    const aprobador = await WorkflowAprobacionAprobadorUsuarioEmpresas.findOne({
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
    const solicitud = await UsuarioEmpresasModel.findOne({
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
      (estadoSolicitud === 'Aprobada' && estadoAprobador === 'Aprobada') ||
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
    console.error('Error interno:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

exports.verifyDecisionUsuarioEmpresas = verifyDecisionUsuarioEmpresas;

const getRequestAprobadasList = async (req,res) => {

  const {username}=req.query



  try {
    const aprobadas = await UsuarioEmpresasModel.findAll({
      where: {
        estado: 'Aprobada',
        username: username,
      },
    });
    res.json({aprobadas});
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener registros aprobados' });
  }
};

exports.getRequestAprobadasList = getRequestAprobadasList;


const updateFavoritoUser=async (req,res)=>{

  const { ruc, razonSocial, username } = req.body;

  try {
    const usuario = await usuarioModel.findOne({ where: { username } });

    if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    usuario.rucEmpresa = ruc;
    usuario.razonSocialEmpresa = razonSocial;
    
    await usuario.save();
    await updateFavorita(username,ruc)

    return res.status(200).json({ message: 'Usuario marcado como favorito' });
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al marcar el usuario como favorito' });
}
}

exports.updateFavoritoUser=updateFavoritoUser


const updateFavorita=async(username,ruc)=>{
  try {
    
    await UsuarioEmpresasModel.update(
        { favorita: false },
        { where: { username: username } }
    );

    const usuarioEmpresa = await UsuarioEmpresasModel.findOne({
        where: {
            username: username,
            ruc: ruc
        }
    });

    if (!usuarioEmpresa) {
        return res.status(404).json({ error: 'Relación usuario-empresa no encontrada' });
    }

    usuarioEmpresa.favorita = true;
    
    await usuarioEmpresa.save();
 

    return res.status(200).json({ message: 'Empresa marcada como favorita' });
} catch (error) {
    console.error("Error al marcar la empresa como favorita:", error);
    return res.status(500).json({ error: 'Error al marcar la empresa como favorita' });
}
}

const findUserEmpresas=async (approverEmail)=>{
  const usuarioDatosEmail = await usuarioModel.findOne({
    where: { username: approverEmail }
  })

  return usuarioDatosEmail
}

const sendApprovalUserEmpresas= async (approverEmail, nameTemplateMail,aprobadorActualRegistro) => { //funcion de correo para los aprobadores

  const dataUser = await findUserEmpresas(approverEmail);

  const nombreA=dataUser.nombresApellidos
  const ruc=aprobadorActualRegistro.ruc;
  const razonSocial=aprobadorActualRegistro.razonSocial
  const fechaCompleta = new Date(aprobadorActualRegistro.fecha);
  const fecha = `${fechaCompleta.getDate().toString().padStart(2, '0')}/${(fechaCompleta.getMonth() + 1).toString().padStart(2, '0')}/${fechaCompleta.getFullYear()}`;


  if (!approverEmail ) {
    throw new Error('Email del aprobador y datos de solicitud son requeridos.');
  }

  try {

    const replacements = {
      nombre: nombreA,
      ruc: ruc,
      razonSocial: razonSocial,
      fecha:fecha
    };

    const accessTokenMail = await haydukMailer.authenticate(config.email.username, config.email.password);
    const type = 'html';
    const templateFileName = nameTemplateMail;
    const asunto = `[Pescando con Hayduk] -  Nueva Empresa Aprobada`;
    let mensajeHTML = await util.getEmailHtmlTemplate(templateFileName, replacements);
    const imageBinaryBuffer = util.getEmailLogo();

    mensajeHTML = mensajeHTML
      .replace(/{{ruc}}/g, replacements.ruc)
      .replace(/{{nombre}}/g, replacements.nombre)
      .replace(/{{razonSocial}}/g, replacements.razonSocial)
      .replace(/{{fecha}}/g,replacements.fecha);

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
    console.error('Error al enviar el correo:', error);
    throw new Error('Error al enviar el correo');
  }
};

exports.sendApprovalUserEmpresas = sendApprovalUserEmpresas;



const contarPendientesPorUsuario = async (req, res) => {
  const { usernameAprobador } = req.query; 

  try {

    const aprobadores = await WorkflowAprobacionAprobadorUsuarioEmpresas.findAll({
      where: {
        usernameAprobador,
        estado: 'Pendiente'
      },
    });

    const numPendientes = aprobadores.length;
    
    res.json({
      pendientes: numPendientes
    });
  } catch (error) {
    console.error("Error al contar las solicitudes pendientes:", error); 
    res.status(500).json({ error: 'Ocurrió un error al contar las solicitudes pendientes.' });
  }
};

exports.contarPendientesPorUsuario  = contarPendientesPorUsuario;
