'use strict';

const checkdate = require('locutus/php/datetime/checkdate');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const config = require('../config/config');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const logger = require('./basic-logger');

var util = {
  jsonResponse: function (code, message, data) {
    return {
      code: code,
      mensaje: message,
      data: data
    }
  },
  getParamPageFromRequest: function (req) {
    var pag = 1;
    if (req.query.pag === undefined) {
      return pag;
    } else if (isNaN(req.query.pag.trim())) {
      return pag;
    } else if (req.query.pag.trim() === "") {
      return pag;
    } else {
      pag = parseInt(req.query.pag.trim());
      if (pag <= 0) {
        pag = 1;
      }
      return parseInt(pag);
    }
  },
  getParamRegPagFromRequest: function (req) {
    var regPag = 1000;
    if (req.query.reg_pag === undefined) {
      return regPag;
    } else if (isNaN(req.query.reg_pag.trim())) {
      return regPag;
    } else if (req.query.reg_pag.trim() === "") {
      return regPag;
    } else {
      regPag = parseInt(req.query.reg_pag.trim());
      if (regPag <= 0) {
        regPag = 1000;
      } else if (regPag > 1500) {
        regPag = 1500;
      }
      return regPag;
    }
  },
  calcularOffsetSqlServer: function (pag, regPag) {
    return (pag - 1) * regPag;
  },
  validarFecha: function (fecha, formato) {
    switch (formato) {
      case "yyyy-mm-dd":
        var valores = fecha.split("-");
        if (valores.length === 3 && checkdate(valores[1], valores[2], valores[0])) {
          return true;
        }
        return false;
      case "yyyy/mm/dd":
        var valores = fecha.split("/");
        if (valores.length === 3 && checkdate(valores[1], valores[2], valores[0])) {
          return true;
        }
        return false;
      case "dd-mm-yyyy":
        var valores = fecha.split("-");
        if (valores.length === 3 && checkdate(valores[1], valores[0], valores[2])) {
          return true;
        }
        return false;
      case "dd/mm/yyyy":
        var valores = fecha.split("/");
        if (valores.length === 3 && checkdate(valores[1], valores[0], valores[2])) {
          return true;
        }
        return false;
      default:
        return false;
    }
  },
  obtenerDifSegFecha: function (fecha1, hora1, fecha2, hora2, formato) {
    var valHora1 = hora1.split(":");
    var valHora2 = hora2.split(":");
    switch (formato) {
      case "yyyy-mm-dd":
        var valFecha1 = fecha1.split("-");
        var tiempo1 = new Date(valFecha1[0], valFecha1[1], valFecha1[2], valHora1[0], valHora1[1], valHora1[2], 0);
        var valFecha2 = fecha2.split("-");
        var tiempo2 = new Date(valFecha2[0], valFecha2[1], valFecha2[2], valHora2[0], valHora2[1], valHora2[2], 0);
        var dif = tiempo1.getTime() - tiempo2.getTime();

        //Si el tiempo 2 es menor, quiere decir que la fecha1 es mayor y por lo tanto se retorna negativo
        var negative = tiempo2.getTime() < tiempo1.getTime() ? true : false;
        var SegundosT1aT2 = dif / 1000;
        return negative ? Math.abs(SegundosT1aT2) * -1 : Math.abs(SegundosT1aT2);
      case "yyyy/mm/dd":
        var valFecha1 = fecha1.split("/");
        var tiempo1 = new Date(valFecha1[0], valFecha1[1], valFecha1[2], valHora1[0], valHora1[1], valHora1[2], 0);
        var valFecha2 = fecha2.split("/");
        var tiempo2 = new Date(valFecha2[0], valFecha2[1], valFecha2[2], valHora2[0], valHora2[1], valHora2[2], 0);
        var dif = tiempo1.getTime() - tiempo2.getTime();

        //Si el tiempo 2 es menor, quiere decir que la fecha1 es mayor y por lo tanto se retorna negativo
        var negative = tiempo2.getTime() < tiempo1.getTime() ? true : false;
        var SegundosT1aT2 = dif / 1000;
        return negative ? Math.abs(SegundosT1aT2) * -1 : Math.abs(SegundosT1aT2);
      case "dd-mm-yyyy":
        var valFecha1 = fecha1.split("-");
        var tiempo1 = new Date(valFecha1[2], valFecha1[1], valFecha1[0], valHora1[0], valHora1[1], valHora1[2], 0);
        var valFecha2 = fecha2.split("-");
        var tiempo2 = new Date(valFecha2[2], valFecha2[1], valFecha2[0], valHora2[0], valHora2[1], valHora2[2], 0);
        var dif = tiempo1.getTime() - tiempo2.getTime();

        //Si el tiempo 2 es menor, quiere decir que la fecha1 es mayor y por lo tanto se retorna negativo
        var negative = tiempo2.getTime() < tiempo1.getTime() ? true : false;
        var SegundosT1aT2 = dif / 1000;
        return negative ? Math.abs(SegundosT1aT2) * -1 : Math.abs(SegundosT1aT2);
      case "dd/mm/yyyy":
        var valFecha1 = fecha1.split("/");
        var tiempo1 = new Date(valFecha1[2], valFecha1[1], valFecha1[0], valHora1[0], valHora1[1], valHora1[2], 0);
        var valFecha2 = fecha2.split("/");
        var tiempo2 = new Date(valFecha2[2], valFecha2[1], valFecha2[0], valHora2[0], valHora2[1], valHora2[2], 0);
        var dif = tiempo1.getTime() - tiempo2.getTime();

        //Si el tiempo 2 es menor, quiere decir que la fecha1 es mayor y por lo tanto se retorna negativo
        var negative = tiempo2.getTime() < tiempo1.getTime() ? true : false;
        var SegundosT1aT2 = dif / 1000;
        return negative ? Math.abs(SegundosT1aT2) * -1 : Math.abs(SegundosT1aT2);
      default:
        return null;
    }
  },
  generarContrasenaHash: function (contrasena) {
    return bcrypt.hashSync(contrasena, bcrypt.genSaltSync(config.bcrypt.saltRounds), null);
  },
  validarContrasena: function (contrasena1, hashContrasena) {
    return bcrypt.compareSync(contrasena1, hashContrasena);
  },
  generateRandomPassword: function(length){
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  cryptoEncrypt: function (texto) {
    var cipher = crypto.createCipher(config.crypto.algorithm, config.crypto.password);
    var crypted = cipher.update(texto, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },
  cryptoDecrypt: function (texto) {
    var decipher = crypto.createDecipher(config.crypto.algorithm, config.crypto.password);
    var dec = decipher.update(texto, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  },
  cryptoGanerateRandomBytes: function(number){
    return crypto.randomBytes(number);
  },
  cryptoEncryptWithIV: function(text, algorithm, key, iv) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
  },
  cryptoDecryptWithIV: function (text, algorithm, key, iv) {
    let iv2 = Buffer.from(iv, 'hex');
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv2);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  },
  consoleLog: function (mensaje) {
    if (!config.production)
      console.log(mensaje);
  },
  generateJWTAuthToken: function (data, expiresIn) {
    let privateKey = fs.readFileSync('config/private.key');
    return jwt.sign(data, privateKey, { algorithm: 'RS256', expiresIn: expiresIn });
  },
  verifyJWTAuthToken: function (authToken) {
    let publicKey = fs.readFileSync('config/public.key');
    return jwt.verify(authToken, publicKey);
  },
  verifyAppToGenerateJWTAuthToken: function (app, password) {
    let jsonString = fs.readFileSync('config/auth.apps.json');
    const authApps = JSON.parse(jsonString);

    try {
      if (authApps[app]) {
        return this.validarContrasena(password, authApps[app])
      }
      return false;
    } catch (err) {
      this.consoleLog(err);
      logger.error(err);
      return false;
    }
  },
  getFilesFromDirectory: function (dir) {
    var files = [];
    try {
      fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (!fs.statSync(filePath).isDirectory()) {
          files.push({ fileName: file, filePath: filePath });
        } else {
          loadAllFilesSync(filePath);
        }
      });
    } catch (err) {
      logger.error(err);
      return null;
    }
    return files;
  },
  getEmailHtmlTemplate: function(template){
    var data = fs.readFileSync('templates/'+template, 'utf8');
    return data;
  },
  getEmailLogo:function(){
    var data = fs.readFileSync('templates/logo-email.png');
    return data;
  },
  getCompliance:function(){
    var data = fs.readFileSync('templates/'+config.app.module.politicaCompliance.filename);
    return data;
  },
  getFolderDateNow:function(){
    var date = new Date();
    var dia = date.getDate() < 10?"0"+date.getDate():""+date.getDate();
    var mes = date.getMonth() < 10?"0"+date.getMonth():""+date.getMonth();
    var anio =""+date.getFullYear();
    return anio+mes+dia;
  },
  streamVideo:function(req, res, filepath, contentType){
    //Streaming del video
    const stat = fs.statSync(filepath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) { 
        //range format is "bytes=start-end", 
        const parts =  
            range.replace(/bytes=/, "").split("-"); 
            
        const start = parseInt(parts[0], 10) 
        /*in some cases end may not exists, if its  
                        not exists make it end of file*/
        const end =  
                parts[1] ?parseInt(parts[1], 10) :fileSize - 1 
            
        //chunk size is what the part of video we are sending. 
        const chunksize = (end - start) + 1 
        /*we can provide offset values as options to 
        the fs.createReadStream to read part of content*/
        const file = fs.createReadStream(filepath, {start, end}) 
            
        const head = { 
            'Content-Range': `bytes ${start}-${end}/${fileSize}`, 
            'Accept-Ranges': 'bytes', 
            'Content-Length': chunksize, 
            'Content-Type': contentType, 
        } 
        /*we should set status code as 206 which is 
                for partial content*/
        // because video is continuosly fetched part by part  
        res.writeHead(206, head); 
        file.pipe(res); 
        
    }else{ 
        
    //if not send the video from start.  
    /* anyway html5 video player play content 
        when sufficient frames available*/
    // It doesn't wait for the entire video to load. 
        
        const head = { 
            'Content-Length': fileSize, 
            'Content-Type': contentType, 
        } 
        res.writeHead(200, head); 
        fs.createReadStream(path).pipe(res); 
    }
  }
};

module.exports = util;