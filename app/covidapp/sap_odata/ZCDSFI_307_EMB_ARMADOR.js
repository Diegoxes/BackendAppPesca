'use strict';

const request = require('request');
const config = require('../../../config/config');
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

module.exports = {
    
    getEmbarcacionListByName: (name) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
            
            const CLASE = 'CDSFI_307_EMB_ARMADOR_CDS';
            
            let finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/ZCDSFI_307_EMB_ARMADOR?$filter=name1 eq ${name}&$format=json`;

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
                            objeto: CLASE,
                            metodo: 'getEmbarcacionListName',
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                        });
                    }
                } catch (e) {
                    console.log(e)
                    reject(e);
                }
            });
        });
    },

    getEmbarcacionListByMatricula: (matricula) => {
        return new Promise((resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
    
            const CLASE = 'ZCDSFI_307_EMB_ARMADOR_CDS';
            let finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/ZCDSFI_307_EMB_ARMADOR?$filter=lifnr eq '${matricula}'&$format=json`;
    
            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
                json: true
            }, function (err, result, body) {
                if (err) return reject(err);
                try {
                    if (result.statusCode == 200 && body.d) {
                        resolve(body); 
                    } else {
                        reject({
                            objeto: CLASE,
                            metodo: 'getEmbarcacionListByMatricula',
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                            body
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    },
    
    getEmbarcacionListByNameOrMatricula:(data)=>{
        let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
        let buff = new Buffer.from(userPassword);
        let userPassword64data = buff.toString('base64');

        const nombre=data.nombre || ""
        const matricula=data.matricula || ""

        const headers = {
            'Authorization': `Basic ${userPassword64data}`,
            "Content-Type": "application/json",
        };

        const CLASE = 'ZCDSFI_307_EMB_ARMADOR_CDS';
        let finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/ZCDSFI_307_EMB_ARMADOR?$filter=name1 eq ${nombre} or lifnr eq '${matricula}'&$format=json`

        request.get({
            url: finalUrl,
            strictSSL: false, 
            rejectUnauthorized: false,
            headers: headers,
            json: true
        }, function (err, result, body) {
            if (err) return reject(err);

            try {
                if (result.statusCode == 200 && body.d ) {
                    resolve(body); 
                } else {
                    reject({
                        objeto: CLASE,
                        metodo: 'getReporteDescarga',
                        statusCode: result.statusCode,
                        statusMessage: result.statusMessage,
                    });
                }
            } catch (e) {
                reject(e);
            }
        });
    },
    getEmbarcacionListPorArmador: (armador) => {
        return new Promise((resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
    
            const CLASE = 'ZCDSFI_307_EMB_ARMADOR_CDS';
            let finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/ZCDSFI_307_EMB_ARMADOR?$filter=lifn2 eq '${armador}'&$format=json`;
    
            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false, 
                json: true
            }, function (err, result, body) {
    
                if (err) return reject(err);
                try {
                    if (result) {
                        resolve(body); 
                    } else {
                        reject({
                            objeto: CLASE,
                            metodo: 'getReporteDescarga',
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
    ,
    getEmbarcacionPorArmadorRucYCodigo: (data) => {
        return new Promise((resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            
            const armadorRuc=data.armadorRuc || "";
            const embarcacion=data.embarcacion ||"";
           
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
    
            const CLASE = 'ZCDSFI_001_CDS';    
            let finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/ZCDSFI_001?$filter=matricula eq '${embarcacion}' and lifnr eq '${armadorRuc}'&$format=json`;

            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
                json: true
            }, function (err, result, body) {
                if (err) {
                    return reject(err); 
                }
                try {
                    if (result.statusCode == 200 && body.d) {
                        return resolve(body);
                    } else {
                        return reject({
                            objeto: CLASE,
                            metodo: 'getRucYCodigo',
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                        });
                    }
                } catch (e) {
                    return reject(e);
                }
            });
        });
    }
    
};