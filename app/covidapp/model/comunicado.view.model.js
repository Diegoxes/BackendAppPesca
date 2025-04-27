'use strict';
module.exports = (sequelize, type, model) => {
  var ComunicadoView = sequelize.define('comunicado_view',
  {
    comunicadoId: {
      primaryKey:true,
      type: type.UUID,
      allowNull: false,
      comment: "Id del comunicado",
      references: {
        model: model.Comunicado,
        key: 'id'
      }
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
    visto:{
        type: type.BOOLEAN,
        allowNull:false,
        required:true
    },
    fechaVisto:{
        type: type.DATE,
        allowNull:false,
        required:true
    }
  },{
    freezeTableName: true
  });
  
  ComunicadoView.associate = function(models) {
   
  };
  
  return ComunicadoView;
};


