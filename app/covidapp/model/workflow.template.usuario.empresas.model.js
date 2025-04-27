'use strict'

module.exports=(sequelize,type,model)=>{

    const TemplateUsuarioEmpresas = sequelize.define('workflow_template_usuario_empresas', 
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
        usernamedisabled:{
            type:type.BOOLEAN,
            allowNull:false
        },
        username2:{
            type: type.STRING,
            allowNull: false
        },
        aprobacionFinal: {
          type: type.BOOLEAN,
          allowNull: false
        },
        estadoAprobado: {
          type: type.STRING,
          allowNull: true
        },
        estadoRechazado: {
          type: type.STRING,
          allowNull: false
        },
        nroAprobacion:{
            type:type.INTEGER,
            allowNull:false
        }
    }, {
      freezeTableName: true ,
      timestamps: true 
    });
  
    return TemplateUsuarioEmpresas;
  }
  