'use strict';

module.exports = (sequelize, type) => {
  var DescargaMpDocumento = sequelize.define('descarga_mp_documento',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      descargaMpId: {
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "descarga mp ID"
      }, 
      azureContainerName: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "azure container name"
      },
      azureDirectoryPath: {
        type: type.STRING(128),
        allowNull: false,
        required: true,
        comment: "azure directory"
      },
      azureBlobName: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "azure blob name"
      },
      labelBlobName: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "label azure blob name"
      },
      etiqueta: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "etiqueta"
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

  DescargaMpDocumento.associate = function (models) {
    
  };

  return DescargaMpDocumento;

};