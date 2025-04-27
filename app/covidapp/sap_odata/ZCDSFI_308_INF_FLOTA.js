'use strict';

const request = require('request');
const config = require('../../../config/config');

const CLASE = 'ZCDSFI_308_INF_FLOTA_CDS';

const { XMLParser, XMLBuilder } = require("fast-xml-parser");



module.exports = {
    getPorInformedeFlota: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
            
            
            const informeFlota = data.informeFlota || "";
            const TRANSACCION = 'ZCDSFI_308_INF_FLOTA';
            
            var finalUrl = `${config.app.module.sapRISE.odataURL}/${TRANSACCION}?$filter=numinf eq '${informeFlota}'&$format=json`;
            
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
                            metodo: 'getPorInformeFlota',
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
    getInformePorMatricula: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
            
            const matricula=data.matricula || ""
            
            var finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_308_INF_FLOTA_CDS/ZCDSFI_308_INF_FLOTA?$filter=matr_sap eq '${matricula}'&$orderby=numinf desc&$top=1&$format=json`;
    
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
                            metodo: 'getPorInformeFlotaMatricula',
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