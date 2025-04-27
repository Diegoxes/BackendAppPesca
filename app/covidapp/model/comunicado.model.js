'use strict';

module.exports = (sequelize, type) => {
  var Comunicado = sequelize.define('comunicado',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      fechaPublicacion:{
        type: type.DATE,
        allowNull: false,
        required: true,
        comment: "Fecha de publicacion"
      },
      titulo: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Titulo"
      }, 
      textoNotificacion: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Texto de notificacion"
      },
      mensaje: {
        type: type.TEXT,
        comment: "Contenido html del comunicado"
      },
      destinoTipoCuentaID: {
        type: type.STRING(3),
        allowNull: true,
        required: false,
        comment: "tipo de cuenta ID destino"
      },
      destinoUsuarios: {
        type: type.TEXT,
        allowNull: false,
        required: true,
        comment: "usernames a notificar separado por comas"
      },
      tieneImagen: {
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        comment: "comunicado con imagen"
      },
      urlImagen: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "url imagen en storage"
      },
      tieneArchivo: {
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        comment: "comunicado con adjunto"
      },
      urlArchivo: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "url del archivo en storage"
      },
      tieneVideo: {
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        comment: "comunicado con video"
      },
      urlVideo: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "url del video en storage"
      },
      estadoPublicacion: {
        type: type.STRING(3),
        allowNull: false,
        required: true,
        comment: "estado de publicación del comunicado"
      },
      estado: {
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        defaultValue:true,
        comment: "estado eliminado = 1, activo = 0"
      }

    }, {
    freezeTableName: true
  });

  Comunicado.associate = function (models) {
    models.Comunicado.hasMany(models.ComunicadoView, {
      as: 'comunicadoView',
      foreignKey: 'comunicadoId',
      onDelete: "CASCADE"
    });

    models.Comunicado.belongsTo(models.TipoCuenta, {
      foreignKey: "destinoTipoCuentaID",
      as: 'destinoTipoCuenta'
    });
  };

  return Comunicado;

};