'use strict';

const config = require('../../../config/config');

module.exports = (sequelize, type) => {
  var LogAcceso = sequelize.define('log_acceso',
  {
    id: {
      primaryKey:true,
      type: type.INTEGER,
      allowNull: false,
      autoIncrement: true,
      comment: "Id "
    },
    username: {
      type: type.STRING(255),
      allowNull: false,
      isEmail: true,
      comment: "Usuario"
    },
    fecha:{
      type: type.DATE,
      allowNull:true
    },
    moduloId: {
      type: type.STRING(255),
      allowNull: false,
      comment: "key del modulo"
    },
    detalle: {
      type: type.STRING(512),
      allowNull: true,
      comment: "detalle"
    },
    cant: {
      type: type.INTEGER,
      allowNull: false,
      defaultValue:1,
      comment: "contador"
    }
  },{
    freezeTableName: true
  });
  
  LogAcceso.associate = function(models) {
    models.LogAcceso.belongsTo(models.Modulo, {
      foreignKey: "moduloId",
      as: 'modulo'
    });
  };
  
  return LogAcceso;
};


