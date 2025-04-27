'use strict';

module.exports = (sequelize, type) => {
  var ZonaPescaReferencia = sequelize.define('zona_pesca_referencia',
    {
      id: {
        primaryKey: true,
        type: type.STRING(32),
        allowNull: false,
        required: true,
        comment: "id"
      },
      nombre:{
        type: type.STRING,
        allowNull: false,
        required: true,
        comment: "nombre"
      },
      lat: {
        type: type.FLOAT,
        allowNull: false,
        required: true,
        comment: "latitud"
      },
      latGMS: {
        type: type.STRING(32),
        allowNull: false,
        required: true,
        comment: "latitud GMS"
      },
      lng: {
        type: type.FLOAT,
        allowNull: false,
        required: true,
        comment: "longitud"
      },
      lngGMS: {
        type: type.STRING(32),
        allowNull: false,
        required: true,
        comment: "longitud GMS"
      },
    }, {
    freezeTableName: true
  });

  ZonaPescaReferencia.associate = function (models) {
  };

  return ZonaPescaReferencia;

};