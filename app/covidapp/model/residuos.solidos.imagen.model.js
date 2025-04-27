'use strict';

module.exports = (sequelize, type) => {
  var ResiduosSolidosImagen = sequelize.define('residuos_solidos_imagen',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      residuosSolidosId: {
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "residuos solidos ID"
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
      etiqueta: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "etiqueta"
      },
      thumbnail: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "thumbnail file"
      },
      thumbnailPath: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "thumbnail path"
      },
      thumbnailFullPath:{
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "thumbnail full path (dir+file)"
      },
      base64header:{
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "base64header"
      },
      estadoProceso: {
        type: type.STRING(3),
        allowNull: false,
        required: true,
        comment: "Estado Proceso"
      },
      archivoHDD:{
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "archivoHDD"
      },
      pathArchivoHDD:{
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "pathArchivoHDD"
      },
      fullPathArchivoHDD:{
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "fullPathArchivoHDD"
      },
      archivoUploadToAzure:{
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        defaultValue:false,
        comment: "archivoUploadToAzure"
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

  ResiduosSolidosImagen.associate = function (models) {
    
  };

  return ResiduosSolidosImagen;

};