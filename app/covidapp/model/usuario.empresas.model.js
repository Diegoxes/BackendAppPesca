'use strict'


module.exports=(sequelize,type,model)=>{

  const UsuarioEmpresas = sequelize.define('usuario_empresas', 
    {
      id: {
        type: type.UUID,
        defaultValue: type.UUIDV4, 
        primaryKey: true
      },
      username: {
        type: type.STRING,
        allowNull: false
      },
      razonSocial: {
        type: type.STRING,
        allowNull: false
      },
      ruc: {
        type: type.STRING,
        allowNull: true
      },
      estado: {
        type: type.STRING,
        allowNull: false
      },
      detalles:{
        type:type.STRING,
        allowNull:false
      },
      favorita: {
        type: type.BOOLEAN,
        defaultValue: false
      },
      fecha:{
        type:type.DATE,
        allowNull:false
      }
  }, {
    freezeTableName: true ,
    timestamps: true 
  });

  UsuarioEmpresas.associate=function(models){
    models.UsuarioEmpresas.belongsTo(models.Usuario, {
      foreignKey: "username",
      as: 'usuarioAprobador'
    });
  }
  return UsuarioEmpresas;

}
