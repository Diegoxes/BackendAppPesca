'use strict';

module.exports = (sequelize, type) => {
  var ZonaPescaZonasReferencia = sequelize.define('zona_pesca_zonas_referencia',
    {
      zonaPescaReferenciaId: {
        primaryKey: true,
        type: type.STRING(32),
        allowNull: false,
        required: true,
        comment: "zonaPescaReferenciaId"
      },
      zonaPescaZonasId: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "zonaPescaZonasId"
      },
      distKM:{
        type: type.FLOAT,
        allowNull: false,
        required: true,
        comment: "distancia en Kilometros"
      },
      distNMI: {
        type: type.FLOAT,
        allowNull: false,
        required: true,
        comment: "distancia en Millas nauticas"
      }
    }, {
    freezeTableName: true
  });

  ZonaPescaZonasReferencia.associate = function (models) {
    models.ZonaPescaZonasReferencia.belongsTo(models.ZonaPescaReferencia, {
      foreignKey: "zonaPescaReferenciaId",
      as: 'zonaPescaReferencia'
    });
  };

  return ZonaPescaZonasReferencia;

};