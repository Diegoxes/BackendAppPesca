'use strict';

module.exports = (sequelize, type) => {
  var WorkflowTemplate = sequelize.define('workflow_template',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      nombre:{
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Nombre"
      },
      descripcion: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Descripción"
      }, 
      estado:{
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        defaultValue:true,
        comment: "estado eliminado = 1, activo = 0"
      }

    }, {
    freezeTableName: true
  });

  WorkflowTemplate.associate = function (models) {
    models.WorkflowTemplate.hasMany(models.WorkflowTemplateAprobador, {
      as: 'aprobadores',
      foreignKey: 'workflowTemplateId',
      onDelete: "CASCADE"
    });
  };

  return WorkflowTemplate;

};