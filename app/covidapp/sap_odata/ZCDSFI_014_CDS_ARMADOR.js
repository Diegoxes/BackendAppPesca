'use strict';

const request = require('request');
const config = require('../../../config/config');

const CLASE = 'ZCDSPP_018_CDS';

const { XMLParser, XMLBuilder } = require("fast-xml-parser");

module.exports = {

    getArmadorList: (data) => {
        return new Promise(async (resolve, reject) => {
            let userPassword = config.app.module.sapRISE.username + ":" + config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');
    
            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type": "application/json",

            };
            
            
                const taxNum=data.taxNum || ""
                const partner=data.partner || ""
                const matricula=data.matricula || ""
                const nombre=data.nombre || ""

                let finalUrl = "";

                // if (taxNum && partner) {
                //     finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=taxnum eq '${taxNum}' and partner eq '${partner}'&$format=json`;
                // } else if (taxNum) {
                //     finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=taxnum eq '${taxNum}'&$format=json`;
                // } else if(taxNum && partner && matricula && name){

                // }
                if (taxNum && partner && matricula && nombre) {
                    finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=taxnum eq '${taxNum}' and partner eq '${partner}' and matricula eq '${matricula}' and nombre eq '${nombre}'&$format=json`;
                } else if (taxNum && partner && matricula) {
                    finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=taxnum eq '${taxNum}' and partner eq '${partner}' and matricula eq '${matricula}'&$format=json`;
                } else if (taxNum && partner && nombre) {
                    finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=taxnum eq '${taxNum}' and partner eq '${partner}' and nombre eq '${nombre}'&$format=json`;
                } else if (taxNum && partner) {
                    finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=taxnum eq '${taxNum}' and partner eq '${partner}'&$format=json`;
                } else if (taxNum) {
                    finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=taxnum eq '${taxNum}'&$format=json`;
                } else if (partner) {
                    finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=partner eq '${partner}'&$format=json`;
                } else if (matricula) {
                    finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=matricula eq '${matricula}'&$format=json`;
                } else if (nombre) {
                    finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=nombre eq '${nombre}'&$format=json`;
                }
            
            

       
            
            //http://HDKS4APPDEV.hayduk.com.pe:50000/sap/opu/odata/sap/ZCDSFI_014_CDS/ZCDSFI_014?$filter=partner eq '0006000000' and taxnum eq '20298674611'&$format=json
            // const finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=partner eq '${partner}' and taxnum eq '${taxNum}'&$format=json`;
            // const finalUrl = `${config.app.module.sapRISE.odataURL}ZCDSFI_014_CDS/ZCDSFI_014?$filter=taxnum eq '${taxNum}'&$format=json`;

    
            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
                json: true
            }, function (err, result, body) {
                if (err) return reject(err);
                try {
                    if (result.statusCode == 200 && body ) {
                        resolve(body); 
                    } else {
                        reject({
                            objeto: CLASE,
                            metodo: 'getArmadorList',
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