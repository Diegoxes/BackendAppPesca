'use strict';

const notificacionModel = require('../app/eurekabi2/sequelize').Notificacion;
const logger = require('./basic-logger');

var utilNotificacion = {
  insertarNotificacion: async function(titulo, username, mensaje, estadoNotificacion, jobEjecutando, toSuperAdmin, resultado){
    try {
      var data = {
        titulo, 
        mensaje, 
        fecha:new Date(),
        estadoNotificacion, 
        jobEjecutando,
        userDelete:0,
        toSuperAdmin:false,
        resultado: resultado
      };
      
      if(username)
        data.username = username;

      if(toSuperAdmin)
      data.toSuperAdmin = toSuperAdmin;
      
      var result = notificacionModel.create(data);
      return result;
      
    } catch (err) {
      logger.error(err);
      throw err;
    }
  },
  editarNotificacion: async function(id, mensaje, estadoNotificacion, jobEjecutando, userDelete, fecha, resultado){
    try {
      var data = {};
      
      if(typeof fecha !== 'undefined' && fecha != null)
        data.fecha = new Date();
      
      if(typeof mensaje !== 'undefined' && mensaje != null)
        data.mensaje = mensaje;
      
      if(typeof estadoNotificacion !== 'undefined' && estadoNotificacion != null)
        data.estadoNotificacion = estadoNotificacion;
      
      if(typeof jobEjecutando !== 'undefined' && jobEjecutando != null)
        data.jobEjecutando = jobEjecutando;
      
      if(typeof userDelete !== 'undefined' && userDelete != null)
        data.userDelete = userDelete;

        if(typeof resultado !== 'undefined' && resultado != null)
        data.resultado = resultado;
      
      id = id+"";
      var arrIds = id.split(",");
      var result = notificacionModel.update(data,{
        where:{
          id:arrIds
        }
      });
      return result;
      
    } catch (err) {
      logger.error(err);
      throw err;
    }
    
  }  
};

module.exports = utilNotificacion;