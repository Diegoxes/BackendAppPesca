'use strict';
const { NOW } = require("sequelize");

module.exports = (sequelize, type) => {
  var UsuarioAceptacionTerminos = sequelize.define('usuario_aceptacion_terminos',
    {
      id: {
        primaryKey: true,
        type      : type.UUID,
        allowNull : false,
        required  : true,
        comment   : "ID"
      },
      username: {
        type      : type.STRING,
        allowNull : false,
        required  : true,
        comment   : "username"
      },
      documento: {
        type     : type.STRING,
        allowNull: false,
        required : true,
        comment  : "nombresApellidos"
      },
      fechaAceptacion: {
        type     : type.DATE,
        allowNull: true,
        required : false,
        comment  : "fechaAceptacionCompliance"
      },
    }, {
    freezeTableName: true
  });

  UsuarioAceptacionTerminos.associate = function (models) {

  };

  return UsuarioAceptacionTerminos;

};