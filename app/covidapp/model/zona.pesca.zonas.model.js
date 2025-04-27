'use strict';

module.exports = (sequelize, type) => {
  var ZonaPescaZonas = sequelize.define('zona_pesca_zonas',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      fecha:{
        type: type.DATEONLY,
        allowNull: false,
        required: true,
        comment: "fecha"
      },
      latGMS: {
        type: type.STRING(32),
        allowNull: false,
        required: true,
        comment: "latitud GMS"
      },
      lngGMS: {
        type: type.STRING(32),
        allowNull: false,
        required: true,
        comment: "longitud GMS"
      },
      lat: {
        type: type.FLOAT,
        allowNull: false,
        required: true,
        comment: "latitud"
      },
      lng: {
        type: type.FLOAT,
        allowNull: false,
        required: true,
        comment: "longitud"
      },
      nombre: {
        type: type.STRING,
        allowNull: false,
        required: true,
        comment: "nombre"
      },
      descripcion: {
        type: type.TEXT,
        allowNull: true,
        required: false,
        comment: "descripcion"
      },
      estado:{
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        defaultValue:true,
        comment: "estado eliminado = 0, activo = 1"
      },
      referencias:{
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        defaultValue:false,
        comment: "referencias procesadas 0 = no, 1 = si"
      }
    }, {
    freezeTableName: true
  });

  ZonaPescaZonas.associate = function (models) {
    models.ZonaPescaZonas.hasMany(models.ZonaPescaZonasReferencia, {
      as: 'zonaPescaZonasReferencia',
      foreignKey: 'zonaPescaZonasId'
    });

  };

  return ZonaPescaZonas;

};