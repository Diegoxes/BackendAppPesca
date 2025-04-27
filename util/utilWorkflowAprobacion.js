'use strict'
const TemporadaModel=require('../app/covidapp/sequelize').Temporada;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const utilWorkflow={

    obtenerTemporadaActual:async()=> {

        function formatearFecha(fecha) {
        const year = fecha.getFullYear();
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0'); 
        const day = fecha.getDate().toString().padStart(2, '0'); 
        return `${year}-${month}-${day}`;
        }

        const fechaActual = formatearFecha(new Date()); 
      
        try {
          const temporada = await TemporadaModel.findOne({
            where: {
              fechaInicio: {
                [Op.lte]: fechaActual 
              },
              fechaFin: {
                [Op.gte]: fechaActual 
              }
            }
          });
      
          if (temporada) {
            return `${temporada.temporada}`;
          } else {
            return 'No estás en ninguna temporada activa.';
          }
        } catch (error) {
          console.error('Error al obtener la temporada actual:', error);
          throw new Error('No se pudo obtener la temporada actual.');
        }
      },
      
     
      
      formatearFecha:(fecha)=> {
        const year = fecha.getFullYear();
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0'); 
        const day = fecha.getDate().toString().padStart(2, '0'); 
        return `${year}-${month}-${day}`;
      },
      
      
      obtenerFechaActual:()=> {
        const date = new Date();
        const day = date.getDate().toString().padStart(2, '0'); 
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
      },
      
      obtenerFechaActualSap:()=>{ 
      
        const fechaActual = new Date();
        const año = fechaActual.getFullYear();
        const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
        const día = fechaActual.getDate().toString().padStart(2, '0'); 
        const horas = fechaActual.getHours().toString().padStart(2, '0'); 
        const minutos = fechaActual.getMinutes().toString().padStart(2, '0'); 
        const segundos = fechaActual.getSeconds().toString().padStart(2, '0'); 
      
        const fechaFormateada = `${año}-${mes}-${día}T${horas}:${minutos}:${segundos}`;
      
        return fechaFormateada;
      } 
}

module.exports=utilWorkflow