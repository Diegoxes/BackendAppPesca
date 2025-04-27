'use strict';

const request = require('request');
const config = require('../../../config/config');

const CLASE = 'ZFI_ARMADORES_RFC_SRV';

const { XMLParser, XMLBuilder } = require("fast-xml-parser");


module.exports = {
    getCSRFToken: () => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                'Content-type': 'application/json',
                'X-CSRF-Token':'fetch'
            };

            //var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/${transaccion}`;
            const transaccion="Z_ARMADOR_PRESTAMOSet"
            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/${transaccion}('101')`;

            request.head({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                try {
                    if(result.statusCode == 200){
                        if('set-cookie' in result.headers && 'x-csrf-token' in result.headers){
                            resolve(result.headers);
                        }else{
                            reject(null);
                        }
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getCSRFToken',
                            statusCode:result.statusCode,
                            statusMessage:result.statusMessage,
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });

        });
    },
    postAdelantoHabilitacion:(resultHeaderCSRFToken, data) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type":"application/json",
                'X-CSRF-Token':resultHeaderCSRFToken['x-csrf-token'],
                'Cookie': resultHeaderCSRFToken['set-cookie']
            };
            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/Z_ARMADOR_PRESTAMOSet`;

            request.post({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
                json:data
            }, function (err, result, body) {
                if (err && err!= null)return reject(err);               
                try {
                    if(result.statusCode == 201 && 'd' in body){
                        const extractedData = {
                            OLifnr: body.d.OLifnr,
                            IBldat: body.d.IBldat,
                            IStcd1: body.d.IStcd1,
                            IBukrs: body.d.IBukrs,
                            IEmbar: body.d.IEmbar,
                            IGsber: body.d.IGsber,
                            IObjkey: body.d.IObjkey,
                            ITippr: body.d.ITippr,
                            IWaers: body.d.IWaers,
                            IWrbtr: body.d.IWrbtr,
                            OObjkey: body.d.OObjkey
                          };
                       
                        resolve(extractedData);
                        // resolve(true);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'postAdelantoHabilitacion',
                            statusCode:result.statusCode,
                            statusMessage:result.statusMessage,
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    },

};