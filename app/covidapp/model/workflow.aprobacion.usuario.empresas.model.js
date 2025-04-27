'use strict'

module.exports=(sequelize,type,model)=>{

    const WorkflowAprobacionUsuarioEmpresas = sequelize.define('workflow_aprobacion_usuario_empresas', 
      {
        id: {
          type: type.UUID,
          defaultValue: type.UUIDV4, 
          primaryKey: true
        },
        fecha: {
          type: type.DATE,
          allowNull: false
        },
        ruc:{
            type:type.STRING,
            allowNull:false
        },
        nombre:{
            type: type.STRING,
            allowNull: false
        },
        detalle: {
          type: type.STRING,
          allowNull: false
        },
        estado: {
          type: type.STRING,
          allowNull: true
        },
    }, {
      freezeTableName: true ,
      timestamps: true 
    });
  
    return WorkflowAprobacionUsuarioEmpresas;
  }
  