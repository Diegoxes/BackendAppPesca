'use strict';

module.exports = (sequelize, type) => {
  var Tolva = sequelize.define('tolva',
    {
      id: {
        primaryKey: true,
        type: type.STRING(10),
        allowNull: false,
        required: true,
        comment: "id"
      },
      chataId: {
        type: type.STRING(4),
        allowNull: false,
        required: true,
        comment: "Chata Id"
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

  Tolva.associate = function (models) {
  };

  return Tolva;

};