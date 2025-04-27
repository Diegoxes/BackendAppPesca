'use strict';

module.exports = (sequelize, type) => {
  var DescargaMp = sequelize.define('descarga_mp',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      informeFlota:{
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Informe Flota"
      },
      armadorId: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Armador ID"
      }, 
      armadorRuc: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Armador ruc"
      },
      armadorNombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Armador nombre"
      },
      embarcacionId: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "embarcacion ID"
      },
      embarcacionMatricula: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "embarcacion matricula"
      },
      embarcacionNombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "embarcacion nombre"
      },
      plantaId: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "planta ID"
      },
      plantaNombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "planta nombre"
      },
      chataId: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "chata id"
      },
      chataNombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "chata nombre"
      },
      tolvaId: {
        type: type.STRING(10),
        allowNull: false,
        required: true,
        comment: "tolva id"
      },
      tolvaNombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "tolva nombre"
      },
      fechaDescarga: {
        type: type.DATE,
        allowNull: false,
        required: true,
        comment: "fecha descarga"
      },
      armadorTelefono: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "Armador telefono"
      },
      armadorEmail: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "Armador email"
      },
      estadoProceso: {
        type: type.STRING(3),
        allowNull: false,
        required: true,
        comment: "Estado Proceso"
      },
      streamUrlPush: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "streamUrlPush"
      },
      streamUrlView: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "streamUrlView"
      },
      streamMaxDate: {
        type: type.DATE,
        allowNull: true,
        required: false,
        comment: "streamMaxDate"
      },
      streamActive: {
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        default: false,
        comment: "streamUrlPush"
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

  DescargaMp.associate = function (models) {
    models.DescargaMp.hasMany(models.DescargaMpImagen, {
      as: 'imagenes',
      foreignKey: 'descargaMpId',
      onDelete: "CASCADE"
    });

    models.DescargaMp.hasMany(models.DescargaMpVideo, {
      as: 'videos',
      foreignKey: 'descargaMpId',
      onDelete: "CASCADE"
    });

    models.DescargaMp.hasMany(models.DescargaMpDocumento, {
      as: 'documentos',
      foreignKey: 'descargaMpId',
      onDelete: "CASCADE"
    });
  };

  return DescargaMp;

};