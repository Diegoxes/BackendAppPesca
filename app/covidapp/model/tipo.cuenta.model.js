'use strict';
module.exports = (sequelize, type) => {
  var TipoCuenta = sequelize.define('tipo_cuenta',
  {
    id: {
      primaryKey:true,
      type: type.STRING(3),
      allowNull: false,
      comment: "Id"
    },
    nombre: {
      type: type.STRING(120),
      allowNull: false,
      isEmail: true,
      comment: "Nombre"
    },
    notificarRegistroA: {
      type: type.STRING(255),
      allowNull: true,
      comment: "notificarRegistroA"
    },
    estado: {
      type: type.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
      comment: "estado"
    }
  },{
    freezeTableName: true,
    hasTrigger:true
  });
  
  TipoCuenta.associate = function(models) {
    
  };
  
  return TipoCuenta;
};