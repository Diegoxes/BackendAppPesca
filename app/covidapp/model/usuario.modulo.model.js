'use strict';

const config = require('../../../config/config');

module.exports = (sequelize, type, model) => {
    var UsuarioModulo = sequelize.define('usuario_modulo',
        {
            id: {
                primaryKey: true,
                type: type.INTEGER,
                allowNull: false,
                autoIncrement: true,
                comment: "Id de la relación"
            },
            username: {
                type: type.STRING,
                allowNull: false,
                required: true,
                comment: "username",
                references: {
                    model: model.Usuario,
                    key: 'username'
                }
            },
            moduloId: {
                type: type.STRING,
                allowNull: false,
                required: true,
                comment: "ID del modulo",
                references: {
                    model: model.Modulo,
                    key: 'id'
                }
            }
        },
         {
        freezeTableName: true
    });

    UsuarioModulo.associate = function (models) {

    };

    return UsuarioModulo;
};


