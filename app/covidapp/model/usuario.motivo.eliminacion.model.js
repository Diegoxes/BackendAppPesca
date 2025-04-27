'use strict';

const config = require('../../../config/config');

module.exports = (sequelize, type) => {
  var UsuarioMotivoEliminacion = sequelize.define('usuario_motivo_eliminacion',
    {
      id: {
        primaryKey: true,
        type: type.UUID,
        allowNull: false,
        required: true,
        comment: "ID"
      },
      username: {
        type: type.STRING,
        allowNull: false,
        required: true,
        isEmail: true,
        comment: "Correo electronico 1"
      },
      motivo: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        defaultValue:"",
        comment: "Motivo de eliminación"
      },
      fecha: {
        type     : type.DATE,
        allowNull: true,
        required : false,
        comment  : "Fecha"
      },
    }, {
    freezeTableName: true
  });

  UsuarioMotivoEliminacion.associate = function (models) {
    
  };

  return UsuarioMotivoEliminacion;

};