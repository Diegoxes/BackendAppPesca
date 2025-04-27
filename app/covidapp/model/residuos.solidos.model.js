'use strict';

module.exports = (sequelize, type) => {
  var ResiduosSolidos = sequelize.define('residuos_solidos',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      armadorId: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Armador ID"
      }, 
      armadorRuc: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Armador ruc"
      },
      armadorNombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "Armador nombre"
      },
      embarcacionId: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "embarcacion ID"
      },
      embarcacionMatricula: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "embarcacion ID"
      },
      embarcacionNombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "embarcacion nombre"
      },
      plantaId: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "planta ID"
      },
      plantaNombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "planta nombre"
      },
      chataId: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "chata id"
      },
      chataNombre: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        comment: "chata nombre"
      },
      fecha: {
        type: type.DATE,
        allowNull: false,
        required: true,
        comment: "fecha descarga"
      },
      estadoProceso: {
        type: type.STRING(3),
        allowNull: false,
        required: true,
        comment: "Estado Proceso"
      },
      estado:{
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        defaultValue:true,
        comment: "estado eliminado = 1, activo = 0"
      }

    }, {
    freezeTableName: true
  });

  ResiduosSolidos.associate = function (models) {
    models.ResiduosSolidos.hasMany(models.ResiduosSolidosImagen, {
      as: 'imagenes',
      foreignKey: 'residuosSolidosId',
      onDelete: "CASCADE"
    });
  };

  return ResiduosSolidos;

};