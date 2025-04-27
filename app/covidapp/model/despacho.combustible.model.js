'use strict';

module.exports = (sequelize, type) => {
  var DespachoCombustible = sequelize.define('despacho_combustible',
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
      fechaDespacho: {
        type: type.DATE,
        allowNull: false,
        required: true,
        comment: "fecha despacho"
      },
      armadorTelefono: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "Armador telefono"
      },
      armadorEmail: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "Armador email"
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

  DespachoCombustible.associate = function (models) {
    models.DespachoCombustible.hasMany(models.DespachoCombustibleImagen, {
      as: 'imagenes',
      foreignKey: 'despachoCombustibleId',
      onDelete: "CASCADE"
    });

    models.DespachoCombustible.hasMany(models.DespachoCombustibleVideo, {
      as: 'videos',
      foreignKey: 'despachoCombustibleId',
      onDelete: "CASCADE"
    });
  };

  return DespachoCombustible;

};