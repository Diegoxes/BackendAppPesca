'use strict';

module.exports = (sequelize, type) => {
  var WorkflowAprobacionAprobador = sequelize.define('workflow_aprobacion_aprobador',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      workflowAprobacionId:{
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "Workflow Aprobacion ID"
      },
      workflowTemplateAprobadorId:{
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "Workflow Template Aprobacion ID"
      },
      usernameAprobador:{
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Nombre de usuario que realiza la aprobación"
      },
      fecha: {
        type: type.DATE,
        allowNull: true,
        required : false,
        comment  : "fecha solicitud"
      },
      detalle: {
        type: type.STRING(512),
        allowNull: false,
        required: true,
        comment: "Detalle de aprobacion"
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

  WorkflowAprobacionAprobador.associate = (models) => {
    models.WorkflowAprobacionAprobador.belongsTo(models.WorkflowAprobacion, {
      foreignKey: 'workflowAprobacionId',
      as: 'solicitud',
    });

    models.WorkflowAprobacionAprobador.belongsTo(models.WorkflowTemplateAprobador,{
        as: 'templateAprobador', // Este es el alias para acceder al template
        foreignKey: 'workflowTemplateAprobadorId'
    })
  };
  return WorkflowAprobacionAprobador;

};