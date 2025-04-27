'use strict';

module.exports = (sequelize, type) => {
  var WorkflowTemplateAprobador = sequelize.define('workflow_template_aprobador',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      workflowTemplateId: {
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "Workflow Template ID"
      }, 
      nroAprobacion:{
        type: type.INTEGER,
        allowNull:false
      },
      username:{
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Nombre de usuario aprobador"
      },
      usernameDisabled:{
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        comment: "Usuario deshabilitado para aprobar"
      },
      username2:{
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Nombre de usuario aprobador de contigencia"
      },
      aprobacionFinal:{
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        comment: "Paso para aprobaciones es el final?"
      },
      funcionAprobacionFinalScript:{
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "Función a ejecutar en caso sea aprobacion final"
      },
      funcionRechazoScript:{
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "Función a ejecutar en caso sea un rechazo"
      },
      estadoAprobado:{
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "Valor del estado aprobado"
      },
      estadoRechazado:{
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "Valor del estado rechazado"
      },
    }, {
    freezeTableName: true
  });

  WorkflowTemplateAprobador.associate = function (models) {

    models.WorkflowTemplateAprobador.belongsTo(models.Usuario, {
      foreignKey: "username",
      as: 'usuarioAprobador'
    });

    models.WorkflowTemplateAprobador.belongsTo(models.Usuario, {
      foreignKey: "username2",
      as: 'usuarioAprobador2'
    });

    models.WorkflowTemplateAprobador.hasMany(models.WorkflowAprobacionAprobador,{
      as: 'aprobadores', // Este es el alias que usarás al incluir
      foreignKey: 'workflowTemplateAprobadorId'
    })
  };

  return WorkflowTemplateAprobador;

};