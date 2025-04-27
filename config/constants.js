'use strict';

module.exports = {
  CODIGO:{
    SERVIDOR:{
      EXITO:200,
      ERROR:500,
      ERROR_UNAUTHORIZED:401,
      ERROR_APP:400,
      ERROR_TOO_MANY_REQUEST:429
    },
    APLICACION:{
      ERROR_CAMPO_OBLIGATORIO:"E001",
      ERROR_FECHA_INI_FIN_DIFERENCIA:"E002",
      ERROR_FECHA_FORMATO_INVALIDO:"E003",
      ERROR_FECHA_INICIO_MENOR_FECHA_FIN:"E004",
      ERROR_REGISTRO_NO_ENCONTRADO:"E005",
      ERROR_REGISTRO_BLOQUEADO_ELIMINAR:"E006",
      ERROR_REGISTRO_DUPLICADO:"E007",
      ERROR_ARCHIVO_NO_VALIDO_EXTENSION:"E008",
      ERROR_NO_PROCESADO:"E009",
      ERROR_CAMPO_NO_VALIDO:"E010",
      ERROR_LOGIN_ARMADOR_UNAUTHORIZED:"E011",
      ERROR_RECAPTCHA:"E012"
    }
  },
  MENSAJE:{
    SERVIDOR:{
      EXITO: "Se proceso correctamente el requerimiento.",
      ERROR: "Ocurrio un error. Disculpe las molestias.",
      ERROR_UNAUTHORIZED: "Acceso no autorizado",
      ERROR_TOO_MANY_REQUEST: "'Demasiadas solicitudes. Intentelo nuevamente dentro de unos minutos'"
    },
    APLICACION:{
      ERROR_CAMPO_OBLIGATORIO:function(campo){
        return campo+" es obligatorio.";
      },
      ERROR_FECHA_INI_FIN_DIFERENCIA:function(campo1, campo2, diferencia){
        return "La difrencia entre "+campo1+" y "+campo2+" debe ser "+diferencia+".";
      },
      ERROR_FECHA_FORMATO_INVALIDO:function(campo,formato){
        return "La "+campo+" no es valida. Debe ser en formato "+formato+".";
      },
      ERROR_FECHA_INICIO_MENOR_FECHA_FIN:function(campo1,campo2){
        return "La "+campo1+" debe ser menor o igual a la "+campo2+".";
      },
      ERROR_REGISTRO_NO_ENCONTRADO:"Registro(s) no encontrado(s).",
      ERROR_REGISTRO_BLOQUEADO_ELIMINAR:"Registro bloqueado, no se puede eliminar.",
      ERROR_REGISTRO_DUPLICADO:function(mensaje){
        return mensaje;
      },
      ERROR_ARCHIVO_NO_VALIDO_EXTENSION:function(campo1){
        return "Archivo no valido. Solo puede cargar archivos de extensión tipo: "+ campo1;
      },
      ERROR_ARCHIVO_NO_VALIDO_EXTENSION:"No se pudo procesar su solicitud. Disculpe las molestias.",
      ERROR_CAMPO_NO_VALIDO:function(texto){
        return texto;
      },
      ERROR_LOGIN_ARMADOR_UNAUTHORIZED:"Estimado Armador, a partir de la temporada 2021-1 el acceso a Pescando con Hayduk es a través de la aplicación de Armadores. Disculpa las moléstias del caso. ",
      ERROR_RECAPTCHA:"Captcha no autorizado",
      ERROR_NO_PROCESADO:"No se pudo procesar su solicitud. Disculpe las molestias.",
    }
  },
  VALORES:{
    DIFERENCIA_FECHAS_7_DIAS:604800
  }  
}


