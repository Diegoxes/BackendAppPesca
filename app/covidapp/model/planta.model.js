'use strict';

module.exports = (sequelize, type) => {
  var Planta = sequelize.define('planta',
    {
      id: {
        primaryKey: true,
        type: type.STRING(4),
        allowNull: false,
        required: true,
        comment: "id"
      },
      nombre: {
        type: type.STRING(128),
        allowNull: false,
        required: true,
        comment: "Nombre"
      }    
    }, {
    freezeTableName: true
  });

  Planta.associate = function (models) {
    models.Planta.hasMany(models.Chata, {
      as: 'chatas',
      foreignKey: 'plantaId',
      onDelete: "CASCADE"
    });
  };

  return Planta;

};