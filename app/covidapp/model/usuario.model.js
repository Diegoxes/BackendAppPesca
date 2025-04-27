'use strict';

const config = require('../../../config/config');

module.exports = (sequelize, type) => {
  var Usuario = sequelize.define('usuario',
    {
      username: {
        primaryKey: true,
        type: type.STRING,
        allowNull: false,
        required: true,
        isEmail: true,
        comment: "Correo electronico 1"
      },
      nombresApellidos: {
        type: type.STRING(255),
        allowNull: false,
        required: true,
        defaultValue:"",
        comment: "Nombres y apellidos"
      },
      email: {
        type: type.STRING,
        allowNull: false,
        required: true,
        isEmail: true,
        comment: "Correo electronico 2"
      },
      tipoDocumentoId:{
        type: type.STRING(3),
        allowNull: false,
        required: true,
        comment: "Tipo documento"
      },
      numeroDocumento:{
        type: type.STRING(32),
        allowNull: false,
        required: true,
        comment: "Numero documento"
      },
      tipoCuentaId:{
        type: type.STRING(3),
        allowNull: false,
        required: true,
        comment: "Tipo de cuenta"
      },
      tipoDocumentoIdEmpleado:{
        type: type.STRING(32),
        allowNull: true,
        required: false,
        comment: "Tipo documento de empleado de familiar"
      },
      numeroDocumentoEmpleado:{
        type: type.STRING(32),
        allowNull: true,
        required: false,
        comment: "Numero documento de empleado de familiar"
      },
      nombresApellidosEmpleado: {
        type: type.STRING(255),
        allowNull: true,
        required: false,
        defaultValue:"",
        comment: "Nombres y apellidos de empleado familiar"
      },
      rucEmpresa:{
        type: type.STRING(11),
        allowNull: true,
        required: false,
        comment: "Ruc empresa"
      },
      razonSocialEmpresa:{
        type: type.STRING(255),
        allowNull: true,
        required: false,
        comment: "Razon social empresa"
      },
      terminos: {
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        comment: "Acepta terminos y condiciones"
      },
      password:{
        type: type.STRING(1024),
        allowNull: false,
        required: true,
        comment: "Password"
      },
      iv:{
        type: type.STRING(512),
        allowNull: false,
        required: true,
        comment: "IV password"
      },
      superAdmin: {
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        defaultValue: false,
        comment: "Es super administrador"
      },
      cuentaConfirmada: {
        type: type.BOOLEAN,
        allowNull: false,
        required: true,
        defaultValue: false,
        comment: "Cta confirmada"
      },
      telefono: {
        type: type.STRING(32),
        allowNull: false,
        required: true,
        defaultValue: '',
        comment: "Telefono contacto"
      },
      compliance: {
        type     : type.BOOLEAN,
        allowNull: false,
        required : true,
        comment  : "compliance"
      },
      fechaAceptacionCompliance: {
        type     : type.DATE,
        allowNull: true,
        required : false,
        comment  : "fechaAceptacionCompliance"
      },
      notificarApp: {
        type: type.BOOLEAN,
        allowNull: false,
        defaultValue:true,
        required: true,
        comment: "Notificar por app"
      },
      notificar2doPlano: {
        type: type.BOOLEAN,
        allowNull: false,
        defaultValue:true,
        required: true,
        comment: "Notificar por app 2do plano"
      },
      notificarEmail: {
        type: type.BOOLEAN,
        allowNull: false,
        defaultValue:true,
        required: true,
        comment: "Notificar por email"
      },
      notificarSMS: {
        type: type.BOOLEAN,
        allowNull: false,
        defaultValue:true,
        required: true,
        comment: "Notificar por SMS"
      },
      notificarWS: {
        type: type.BOOLEAN,
        allowNull: false,
        defaultValue:true,
        required: true,
        comment: "Notificar por Whatsapp"
      },
    }, {
    freezeTableName: true
  });

  Usuario.associate = function (models) {
    models.Usuario.belongsToMany(models.Modulo, {
      through: 'usuario_modulo',
      as: 'modulos',
      foreignKey: 'username',
      otherKey: 'moduloId'
    });

    models.Usuario.belongsTo(models.TipoDocumento, {
      foreignKey: "tipoDocumentoId",
      as: 'tipoDocumento'
    });

    models.Usuario.belongsTo(models.TipoDocumento, {
      foreignKey: "tipoDocumentoIdEmpleado",
      as: 'tipoDocumentoEmpleado'
    });

    models.Usuario.belongsTo(models.TipoCuenta, {
      foreignKey: "tipoCuentaId",
      as: 'tipoCuenta'
    });

  };

  return Usuario;

};