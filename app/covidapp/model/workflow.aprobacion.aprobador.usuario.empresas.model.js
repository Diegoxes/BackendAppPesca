'use strict'

module.exports=(sequelize,type,model)=>{

    const WorkflowAprobacionAprobadorUsuarioEmpresas = sequelize.define('workflow_aprobacion_usuarioEmpresas_aprobador', 
      {
        id: {
          type: type.UUID,
          defaultValue: type.UUIDV4, 
          primaryKey: true
        },
        worflowAprobacionUsuarioEmpresasId: {
          type: type.UUID,
          allowNull: false
        },
      
        usernameAprobador:{
            type: type.STRING,
            allowNull: false
        },
        fecha: {
          type: type.DATE,
          allowNull: false
        },
        estado: {
          type: type.STRING,
          allowNull: true
        },
        detalle:{
            type:type.STRING,
            allowNull:false
        }
    }, {
      freezeTableName: true ,
      timestamps: true 
    });
  
    return WorkflowAprobacionAprobadorUsuarioEmpresas;
  }
  