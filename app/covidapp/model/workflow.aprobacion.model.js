'use strict';


module.exports = (sequelize, type) => {
  var WorkflowAprobacion = sequelize.define('workflow_aprobacion',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      workflowTemplateId:{
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "Workflow Template ID"
      },
      fecha: {
        type     : type.DATE,
        allowNull: true,
        required : false,
        comment  : "fecha solicitud"
      },
      nombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Nombre del flujo de aprobacion."
      },
      data: {
        type: type.STRING('MAX'),
        allowNull: false,
        required: true,
        comment: "Data del flujo de aprobacion separado por |"
      }, 
      detalle: {
        type: type.STRING('MAX'),
        allowNull: false,
        required: true,
        comment: "Detalle de las aprobaciones en texto."
      }, 
      estado:{
        type: type.STRING(32),
        allowNull: false,
        required: true,
        comment: "Estado segun el template"
      }
    }, {
    freezeTableName: true
  });


  WorkflowAprobacion.associate=function(models){
    models.WorkflowAprobacion.hasMany(models.WorkflowAprobacionAprobador,{
       as: 'aprobadores', // Este es el alias que usas en tu consulta
    foreignKey: 'workflowAprobacionId'
    })
  }


  // hasMany(workflow_aprobacion_aprobador, {
  //   foreignKey: 'workflowAprobacionId',
  //   as: 'aprobadores', // Alias que usarás para incluir en las consultas
  // });
  return WorkflowAprobacion;

};