'use strict';
module.exports = (sequelize, type) => {
  var TipoCuentaModulo = sequelize.define('tipo_cuenta_modulo',
  {
    tipoCuentaId: {
      primaryKey:true,
      type: type.STRING(3),
      allowNull: false,
      comment: "Tipo cuenta Id"
    },
    moduloId: {
      primaryKey:true,
      type: type.STRING(255),
      allowNull: false,
      isEmail: true,
      comment: "Modulo Id"
    }
  },{
    freezeTableName: true,
    hasTrigger:true
  });
  
  TipoCuentaModulo.associate = function(models) {
    
  };
  
  return TipoCuentaModulo;
};