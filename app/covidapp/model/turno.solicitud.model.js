'use strict';

module.exports = (sequelize, type) => {
  var TestSolicitudTurno = sequelize.define('turno_solicitud',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      ambito: {
        type     : type.STRING,
        allowNull: false,
        required : true,
        comment  : "matricula de embarcacion"
      },
      embarcacionId: {
        type     : type.STRING,
        allowNull: false,
        required : true,
        comment  : "matricula de embarcacion"
      },
      embarcacionMatricula: {
        type     : type.STRING,
        allowNull: false,
        required : true,
        comment  : "matricula de embarcacion"
      },
      fechaSolicitud: {
        type     : type.DATE,
        allowNull: true,
        required : false,
        comment  : "fecha solicitud"
      },
      lat: {
        type     : type.FLOAT,
        allowNull: false,
        required : true,
        comment  : "lat de embarcacion"
      },
      lng: {
        type     : type.FLOAT,
        allowNull: false,
        required : true,
        comment  : "lng de embarcacion"
      },
      plantaId: {
        type     : type.STRING(4),
        allowNull: true,
        required : false,
        comment  : "Id de planta"
      },
      estado: {
        type        : type.INTEGER,
        allowNull   : false,
        required    : true,
        comment     : "Estado de la solicitud de turno"
      },
      intento: {
        type        : type.INTEGER,
        allowNull   : true,
        required    : true,
        comment     : "Intento de la solicitud de turno"
      },
      username: {
        type        : type.STRING,
        allowNull   : true,
        required    : false,
        comment     : "Usuario que solicita el turno"
      }
    }, {
    freezeTableName: true
  });

  TestSolicitudTurno.associate = function (models) {

  };

  return TestSolicitudTurno;

};