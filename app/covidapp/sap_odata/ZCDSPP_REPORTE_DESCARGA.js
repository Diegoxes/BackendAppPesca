'use strict';

const request = require('request');
const config = require('../../../config/config');

const CLASE = 'ZCDSPP_018_CDS';

const { XMLParser, XMLBuilder } = require("fast-xml-parser");



module.exports = {
    getReporteDescarga: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
            
            const p_matric=data.p_matric || ""
            const p_tempor=data.p_tempor || ""
            const p_centro=data.p_centro || ""
            
            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/ZCDSPP_018(p_matric='${p_matric}',p_tempor='${p_tempor}',p_centro='${p_centro}')/Set?$format=json`;
    
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
    },
};