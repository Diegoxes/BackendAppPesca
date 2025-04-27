'use strict';

const request = require('request');
const config = require('../../../config/config');

const CLASE = 'ZCDSPP_018_CDS';

const { XMLParser, XMLBuilder } = require("fast-xml-parser");
//http://hdks4appqas.hayduk.com.pe:50000/sap/opu/odata/sap/ZCDSPP_018_CDS/ZCDSPP_018(p_matric='6259',p_tempor='202401',p_centro='H101')/Set?$format=json


module.exports = {
    getCalas: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };
            
            const {fechaHana}=data
            var finalUrl = `${config.app.module.sapRISE}ZCDSPP_405_CDS/ZCDSPP_405?$filter=feccal1 eq'${fechaHana}'`;
    
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
                            metodo: 'getCalas',
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