'use strict';

module.exports = (sequelize, type) => {
  var TurnoInforme = sequelize.define('turno_informe',
    {
      informeFlota: {
        primaryKey: true,
        type: type.STRING,
        allowNull: false,
        required: true,
        comment: "informeFlota"
      },
      turnoNotificado: {
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        comment: "Turno Notificado"
      }
    }, {
    freezeTableName: true
  });

  TurnoInforme.associate = function (models) {
  };

  return TurnoInforme;

};
