'use strict';

const request = require('request');
const config = require('../../../config/config');

const CLASE = 'ZFISV_ARM_SRV_SRV';

const { XMLParser, XMLBuilder } = require("fast-xml-parser");


module.exports = {
    getMaestraParametros: () => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/Maestra?$filter=sTabla eq 'PARAMETRO'`

            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                try {
                    if(result.statusCode == 200){
                        const parser = new XMLParser();
                        let jObj = parser.parse(body);
                        if(typeof jObj.feed == 'undefined'){
                            resolve(null);
                        }
                        resolve(jObj.feed.entry);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getMaestraParametros',
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
    getCSRFToken: (transaccion) =>{
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                'Content-type': 'application/json',
                'X-CSRF-Token':'fetch'
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/${transaccion}`;

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
    getSolicitudesPendientesAdelanto: (rucEmpresa) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/SolicitudPendAdelanto?$orderby=dFechaRegistro desc&$top=50&$filter=sIDRUC eq '${rucEmpresa}'`
            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                try {
                    if(result.statusCode == 200){
                        const parser = new XMLParser();
                        let jObj = parser.parse(body);
                        if(typeof jObj.feed == 'undefined'){
                            resolve(null);
                        }

                        resolve(jObj.feed.entry);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getSolicitudesPendientesAdelanto',
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
    getSolicitudPendienteAdelanto: (workflowId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };
          
            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/SolicitudPendAdelanto('${workflowId}')`
            
            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                
                try {
                    if(result.statusCode == 200){
                        const parser = new XMLParser();
                        let jObj = parser.parse(body);
                        if(typeof jObj.entry == 'undefined'){
                            resolve(null);
                        }

                        resolve(jObj.entry.content['m:properties']);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getSolicitudPendienteAdelanto',
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
    postSolicitudesPendientesAdelanto:(resultHeaderCSRFToken, data) => {
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
            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/SolicitudPendAdelanto`;

            request.post({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
                json:data
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                try {
                    if(result.statusCode == 201 && 'd' in body){
                        resolve(true);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'postSolicitudesPendientesAdelanto',
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
    putSolicitudesPendientesAdelanto:(resultHeaderCSRFToken, workflowId, data) => {
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
            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/SolicitudPendAdelanto('${workflowId}')`;

            request.put({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
                json:data
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                try {
                    if(result.statusCode == 204){
                        resolve(true);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'putSolicitudesPendientesAdelanto',
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
    deleteSolicitudesPendientesAdelanto:(resultHeaderCSRFToken, workflowId, data) => {
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
            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/SolicitudPendAdelanto('${workflowId}')`;

            request.put({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
                json:data
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                try {
                    if(result.statusCode == 204){
                        resolve(true);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'deleteSolicitudesPendientesAdelanto',
                            statusCode:result.statusCode,
                            statusMessage:result.statusMessage,
                        });
                    }
                } catch (e) {
                    console.log(e);
                    reject(e);
                }
            });
        });
    },
    getSolicitudesPendientesHabilitaciones: (rucEmpresa) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/SolicitudPendHabilitacion?$orderby=dFechaRegistro desc&$top=50&$filter=sIDRUC eq '${rucEmpresa}'`

            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                try {
                    if(result.statusCode == 200){
                        const parser = new XMLParser();
                        let jObj = parser.parse(body);
                        if(typeof jObj.feed == 'undefined'){
                            resolve(null);
                        }

                        resolve(jObj.feed.entry);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getSolicitudesPendientesHabilitaciones',
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
    getSolicitudPendienteHabilitacion: (workflowId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/SolicitudPendHabilitacion('${workflowId}')`

            request.get({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                
                try {
                    if(result.statusCode == 200){
                        const parser = new XMLParser();
                        let jObj = parser.parse(body);
                        if(typeof jObj.entry == 'undefined'){
                            resolve(null);
                        }

                        resolve(jObj.entry.content['m:properties']);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getSolicitudPendienteHabilitacion',
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
    postSolicitudesPendientesHabilitacion:(resultHeaderCSRFToken, data) => {
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
            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/SolicitudPendHabilitacion`;

            request.post({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
                json:data
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                try {
                    if(result.statusCode == 201 && 'd' in body){
                        resolve(true);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'postSolicitudesPendientesHabilitacion',
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
    putSolicitudesPendientesHabilitacion:(resultHeaderCSRFToken, workflowId, data) => {
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
            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/SolicitudPendHabilitacion('${workflowId}')`;

            request.put({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
                json:data
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                try {
                    if(result.statusCode == 204){
                        resolve(true);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'putSolicitudesPendientesHabilitacion',
                            statusCode:result.statusCode,
                            statusMessage:result.statusMessage,
                        });
                    }
                } catch (e) {
                    console.log(e);
                    reject(e);
                }
            });
        });
    },
    deleteSolicitudesPendientesHabilitacion:(resultHeaderCSRFToken, workflowId, data) => {
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
            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/SolicitudPendHabilitacion('${workflowId}')`;

            request.put({
                url: finalUrl,
                headers: headers,
                strictSSL: false, 
                rejectUnauthorized: false,
                json:data
            }, function (err, result, body) {
                if (err && err!= null) return reject(err);
                try {
                    if(result.statusCode == 204){
                        resolve(true);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'deleteSolicitudesPendientesHabilitacion',
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