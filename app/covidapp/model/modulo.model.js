'use strict';
module.exports = (sequelize, type) => {
  var Modulo = sequelize.define('modulo',
  {
    id: {
      primaryKey:true,
      type: type.STRING,
      allowNull: false,
      comment: "Id del modulo"
    },
    nombre: {
      type: type.STRING,
      allowNull: false,
      isEmail: true,
      comment: "Nombre del modulo"
    },
    hierarchyLevel:{
      type: type.INTEGER,
      defaultValue:0,
      allowNull:false
    }
  },{
    freezeTableName: true,
    hasTrigger:true
  });
  
  Modulo.associate = function(models) {
    models.Modulo.belongsTo(models.Modulo, {
      foreignKey: "padreId",
      as: 'moduloPadre',
      onDelete: "CASCADE"
    });

    models.Modulo.belongsToMany(models.Usuario, {
      through: 'usuario_modulo',
      as: 'usuarios',
      foreignKey: 'moduloId',
      otherKey: 'username'
    });
  };
  
  return Modulo;
};


