'use strict';

const request = require('request');
const config = require('../../../config/config');


const { XMLParser, XMLBuilder } = require("fast-xml-parser");


module.exports = {
    getMiTurno: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
            
            const matricula=data.matricula
           
            let finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSPM_004_CDS/ZCDSPM_004?$filter=matricula eq '${matricula}'&$format=json`;
            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false, 
                json: true
            }, function (err, result, body) {
                if (err) return reject(err);
    
                try {
                    if (result.statusCode == 200 && body.d ) {
                        resolve(body); 
                    } else {
                        reject({
                            metodo: 'getMiTurno',
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    },
    getTurnoPrevio: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };

            function convertSAPDate(dateString) {
                const match = /\/Date\((\d+)\)\//.exec(dateString);
                if (!match) return null;
            
                const timestamp = parseInt(match[1], 10);
                const date = new Date(timestamp);
            
                
                const pad = (n) => n.toString().padStart(2, '0');
                const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            
                
                return `datetime'${formattedDate}'`;
            }
            const {turno,planta,fecha}=data
            const fechaSAP=convertSAPDate(fecha)
            
            const finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSPP_009_CDS/ZCDSPP_009(p_turno='${turno}',p_werks='${planta}',p_fecdes=${fechaSAP})/Set?$format=json`;
            
            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false, 
                json: true
            }, function (err, result, body) {
                if (err) return reject(err);
    
                try {
                    if (result.statusCode == 200 && body.d ) {
                        resolve(body); 
                    } else {
                        reject({
                            metodo: 'getTurnoPrevio',
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    },
    getTurnoSiguiente: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
            
            const {matricula,fechaDescarga}=data
            const fechaFormateada = `${fechaDescarga.slice(0, 4)}-${fechaDescarga.slice(4, 6)}-${fechaDescarga.slice(6, 8)}T00:00:00`;
            
            let finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSPP_404_CDS/ZCDSPP_404?$filter=matricula eq ${matricula} and fecha_desc  eq  datetime'${fechaFormateada}'&$format=json`;

            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false, 
                json: true
            }, function (err, result, body) {
                if (err) return reject(err);
    
                try {
                    if (result.statusCode == 200 && body.d ) {
                        resolve(body); 
                    } else {
                        reject({
                            metodo: 'getTurnoSiguiente',
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    },
    getTurnoPlanta: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
            
            const {planta,fechaDescarga}=data
            const fechaFormateada = `${fechaDescarga.slice(0, 4)}-${fechaDescarga.slice(4, 6)}-${fechaDescarga.slice(6, 8)}T00:00:00`;

            let finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSPP_007_CDS/ZCDSPP_007?$filter=fecha_desc eq datetime'${fechaFormateada}' and estado eq '09'`;

            if (planta) {
                finalUrl += ` and werks eq '${planta}'`;
            }

            finalUrl += "&$format=json";
          
            // let finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSPP_007_CDS/ZCDSPP_007?$filter=fecha_desc eq datetime'${fechaDescarga}' and estado eq '09' and planta eq '${planta}'&$format=json`;

            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false, 
                json: true
            }, function (err, result, body) {
                if (err) return reject(err);
    
                try {
                    if (result.statusCode == 200 && body.d ) {
                        resolve(body); 
                    } else {
                        reject({
                            metodo: 'getTurnoPlanta',
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    },
    getTurnoActual: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
            
            function convertSAPDate(dateString) {
                const match = /\/Date\((\d+)\)\//.exec(dateString);
                if (!match) return null;
            
                const timestamp = parseInt(match[1], 10);
                const date = new Date(timestamp);
            
                
                const pad = (n) => n.toString().padStart(2, '0');
                const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            
                
                return `datetime'${formattedDate}'`;34
            }
            const {planta,fecha}=data
            const fechaFormateada = convertSAPDate(fecha)

            
         
        let finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSPP_036_CDS/ZCDSPP_036(`;

        if (planta) {
            finalUrl += `p_werks='${planta}'`;
        }

        if (fecha) {
            if (planta) {
                finalUrl += `,`;
            }
            finalUrl += `p_fecha=${fechaFormateada}`;
        }

        finalUrl += `)/Set?$format=json`;

            // let finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSPM_004_CDS/ZCDSPM_004?$filter=matricula eq ${matricula}&$format=json`;

            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false, 
                json: true
            }, function (err, result, body) {
                if (err) return reject(err);
    
                try {
                    if (result.statusCode == 200 && body.d ) {
                        resolve(body); 
                    } else {
                        reject({
                            metodo: 'getTurnoActual',
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    },
    getEmbarcacionTurno: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
            
            const {plantaId,fechaHanna,embarcacionMatricula}=data
            const fechaFormateada = `${fechaHanna.slice(0, 4)}-${fechaHanna.slice(4, 6)}-${fechaHanna.slice(6, 8)}T00:00:00`;

            let finalUrl = `${config.app.module.sapRISE.odataURL}/ZCDSPP_035_CDS/ZCDSPP_035(
                pi_werks='${plantaId}',
                pi_fecha_desc=datetime'${fechaFormateada}',
                pi_matricula='${embarcacionMatricula}'
              )/Set?$format=json&$top=1`;

            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false, 
                json: true
            }, function (err, result, body) {
                if (err) return reject(err);
    
                try {
                    if (result.statusCode == 200 && body.d ) {
                        resolve(body); 
                    } else {
                        reject({
                            metodo: 'getEmbarcacionTurno',
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    },
};