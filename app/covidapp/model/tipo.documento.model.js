'use strict';
module.exports = (sequelize, type) => {
  var TipoDocumento = sequelize.define('tipo_documento',
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
    }
  },{
    freezeTableName: true,
    hasTrigger:true
  });
  
  TipoDocumento.associate = function(models) {
    
  };
  
  return TipoDocumento;
};