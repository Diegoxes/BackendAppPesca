'use strict';

module.exports = (sequelize, type) => {
  var Chata = sequelize.define('chata',
    {
      id: {
        primaryKey: true,
        type: type.STRING(4),
        allowNull: false,
        required: true,
        comment: "id"
      },
      plantaId: {
        type: type.STRING(4),
        allowNull: false,
        required: true,
        comment: "Planta Id"
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

  Chata.associate = function (models) {
    models.Chata.hasMany(models.Tolva, {
      as: 'tolvas',
      foreignKey: 'chataId',
      onDelete: "CASCADE"
    });
  };

  return Chata;

};