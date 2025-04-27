'use strict';

const request = require('request');
const config = require('../../../config/config');


const { XMLParser, XMLBuilder } = require("fast-xml-parser");


module.exports = {
    getOrdenesCompraArmador: (data) => {
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
            
            const { rucEmpresa, fechaInicio, fechaFin, regPag, offSet, codigoEmbarcacion } = data;
            
            const fechaInicioSAP = convertSAPDate(fechaInicio); // "/Date(1328054400000)/"
            const fechaFinSAP = convertSAPDate(fechaFin);
            
            
            let finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSMM_021_CDS/ZCDSMM_021(`;
            let params = [];  
            
            if (rucEmpresa) {
                params.push(`p_ruc='${rucEmpresa}'`);
            }
            
            if (fechaInicioSAP) {
                params.push(`p_fec_i=${fechaInicioSAP}`);
            }
            
            if (fechaFinSAP) {
                params.push(`p_fec_f=${fechaFinSAP}`);
            }
            
            if (regPag) {
                params.push(`p_limit=${regPag}`);
            }
            
            // if (offSet) {
                params.push(`p_offset=${offSet}`);
            // }
            
            if (codigoEmbarcacion) {
                params.push(`p_codigo_embarcacion='${codigoEmbarcacion}'`);
            }
            
           
            if (params.length > 0) {
                finalUrl += params.join(','); // Unir todos los parámetros con una coma
            }
            
            
            if (params.length > 0) {
                finalUrl += `)/Set?$format=json`;
            } else {
                finalUrl += `/Set?$format=json`;
            }
            
           

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
                            metodo: 'getOrdenesCompraArmador',
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
    getOrdenesCompraArmadorCount: (data) => {
        
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

            const CLASE='ZCDSMM_016_CDS'
            const TRANSACCION='ZCDSMM_016'
            const {rucEmpresa,fechaInicio,fechaFin,codigoEmbarcacion}=data;
            const fechaInicioSAP=convertSAPDate(fechaInicio);
            const fechaFinSAP=convertSAPDate(fechaFin)

            let finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/${TRANSACCION}(`;

            if (rucEmpresa) {
                finalUrl += `p_ruc='${rucEmpresa}'`;
            }
            
            if (fechaInicio) {
                if (rucEmpresa) {
                    finalUrl += `,`;
                }
                finalUrl += `p_FEC_I=${fechaInicioSAP}`;
            }
            
            if (fechaFin) {
                if (rucEmpresa || fechaInicio) {
                    finalUrl += `,`; 
                }
                finalUrl += `p_FEC_F=${fechaFinSAP}`;
            }
            
            if (codigoEmbarcacion) {
                if (rucEmpresa || fechaInicio || fechaFin) {
                    finalUrl += `,`; 
                }
                finalUrl += `p_codigoEmbarcacion='${codigoEmbarcacion}'`;
            }
            
            finalUrl += `)/Set?$format=json`;

            request.get({
                url: finalUrl,
                strictSSL: false, 
                rejectUnauthorized: false, 
                headers: headers,
                json: true
            }, function (err, result, body) {
                if (err) return reject(err);
    
                try {
                    if (result && body.d ) {
                        resolve(body); 
                    } else {
                        reject({
                            metodo: 'getOrdenesCompraCount',
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