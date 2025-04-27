'use strict';

module.exports = (sequelize, type) => {
  var TurnoPlantaGeocerca = sequelize.define('turno_planta_geocerca',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      plantaId: {
        type: type.STRING(4),
        allowNull: true,
        required: false,
        comment: "planta ID"
      },
      nombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "nombre"
      },
      geom: {
        type: type.STRING('max'),
        allowNull: false,
        required: true,
        comment: "Geometria de la geocerca"
      },
      estado:{
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        defaultValue:true,
        comment: "estado activo = 1, eliminado = 0"
      }

    }, {
    freezeTableName: true
  });

  TurnoPlantaGeocerca.associate = function (models) {
    models.TurnoPlantaGeocerca.belongsTo(models.Planta, {
        foreignKey: "plantaId",
        as: 'planta'
    });
  };

  return TurnoPlantaGeocerca;

};