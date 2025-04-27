'use strict'
module.exports = (sequelize, type) => {
  const Temporada = sequelize.define('temporada', {
    temporada: {
      type: type.STRING,
      primaryKey: true,
      allowNull: false,
    },
    fechaInicio: {
      type: type.DATE,
      allowNull: false,
    },
    fechaFin: {
      type: type.DATE,
      allowNull: false,
    },
    activa: {
     type: type.INTEGER,
      allowNull: false,
     },
  }, {
    freezeTableName: true,
    timestamps: false,  
  });

  return Temporada;
}