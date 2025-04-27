'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
  const WorkflowAprobacionSapIds = sequelize.define('workflow_aprobacion_sapIds', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    workflowAprobacionId: {
      type: type.UUID,
      allowNull: false,
      // references: {
      //   model: 'workflow_aprobacion', 
      //   key: 'id'
      // },
      // onUpdate: 'CASCADE',
      // onDelete: 'CASCADE'
    },
    workflowTemplateId: {
      type: type.UUID,
      allowNull: false,
      // references: {
      //   model: 'workflow_template', 
      //   key: 'id'
      // },
    }
  });

  // WorkflowAprobacionSapIds.associate = function (models) {
  //   WorkflowAprobacionSapIds.belongsTo(models.WorkflowAprobacion, {
  //     foreignKey: 'workflowAprobacionId',
  //     as: 'workflowAprobacion'
  //   });

  //   WorkflowAprobacionSapIds.belongsTo(models.WorkflowTemplate, {
  //     foreignKey: 'workflowTemplateId',
  //     as: 'workflowTemplate'
  //   });
  // };

  return WorkflowAprobacionSapIds;
};