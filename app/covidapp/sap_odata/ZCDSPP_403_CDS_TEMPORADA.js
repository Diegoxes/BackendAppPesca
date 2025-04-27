'use strict';

const request = require('request');
const config = require('../../../config/config');


const { XMLParser, XMLBuilder } = require("fast-xml-parser");
//http://hdks4appqas.hayduk.com.pe:50000/sap/opu/odata/sap/ZCDSPP_018_CDS/ZCDSPP_018(p_matric='6259',p_tempor='202401',p_centro='H101')/Set?$format=json


module.exports = {
    getTemporadas: () => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSPP_403_CDS/ZCDSPP_403?$filter=idregion eq '01'&$format=json`;

            
            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false, 
                json: true
            }, function (err, result, body) {
                if (err) return reject(err);
                try {
                    if (result && body.d ) {
                        resolve(body); 
                    } else {
                        reject({
                            metodo: 'getTemporadas',
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