'use strict';

const request = require('request');
const config = require('../../../config/config');

const CLASE = 'ZSCP_ARMADORES_SRV';

const { XMLParser, XMLBuilder } = require("fast-xml-parser");

module.exports = {
    getLiquidacionSet: (rucEmpresa, anio) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionSet?$filter=IDRuc eq '${rucEmpresa}' and IDEjercicio eq '${anio}'`;

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
                            metodo: 'getLiquidacionSet',
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
    getLiquidacion:(rucEmpresa, liquidacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionSet?$filter=IDLiquidacion eq '${liquidacionId}' and IDRuc eq '${rucEmpresa}'`;

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
                            metodo: 'getLiquidacion',
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
    getLiquidacionPDF: (liquidacionId) =>{
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type":'application/xml'
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/AdjuntoLiqSet?$filter=IDLiquidacion eq '${liquidacionId}'`;

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
                            objeto:'ZFISV_ARM_SRV_SRV',
                            metodo: 'getLiquidacionPDF',
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
    getLiquidacionFacturasXPagar:(rucEmpresa, liquidacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionFactPagSet?$filter=IDRuc eq '${rucEmpresa}' and IDLiquidacion eq '${liquidacionId}'`;

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
                            metodo: 'getLiquidacionFacturasXPagar',
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
    getLiquidacionDescuentoFep:(rucEmpresa, liquidacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionDescFepSet?$filter=IDRuc eq '${rucEmpresa}' and IDLiquidacion eq '${liquidacionId}'`;

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
                            metodo: 'getLiquidacionDescuentoFep',
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
    getLiquidacionVentaPetroleo:(rucEmpresa, liquidacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionVentaPetSet?$filter=IDRuc eq '${rucEmpresa}' and IDLiquidacion eq '${liquidacionId}'`;

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
                            metodo: 'getLiquidacionVentaPetroleo',
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
    getLiquidacionMaterialesServicios:(rucEmpresa, liquidacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionMatServSet?$filter=IDRuc eq '${rucEmpresa}' and IDLiquidacion eq '${liquidacionId}'`;

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
                            metodo: 'getLiquidacionMaterialesServicios',
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
    getLiquidacionHabilitaciones:(rucEmpresa, liquidacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionHabilitSet?$filter=IDRuc eq '${rucEmpresa}' and IDLiquidacion eq '${liquidacionId}'`;

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
                            metodo: 'getLiquidacionHabilitaciones',
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
    getLiquidacionAdelantos:(rucEmpresa, liquidacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionAdelSet?$filter=IDRuc eq '${rucEmpresa}' and IDLiquidacion eq '${liquidacionId}'`;

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
                            metodo: 'getLiquidacionAdelantos',
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
    getLiquidacionOtrosDescuentos:(rucEmpresa, liquidacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionOtrosDescSet?$filter=IDRuc eq '${rucEmpresa}' and IDLiquidacion eq '${liquidacionId}'`;

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
                            metodo: 'getLiquidacionOtrosDescuentos',
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
    getLiquidacionDetracciones:(rucEmpresa, liquidacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionDetracSet?$filter=IDRuc eq '${rucEmpresa}' and IDLiquidacion eq '${liquidacionId}'`;

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
                            metodo: 'getLiquidacionDetracciones',
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
    getLiquidacionPagosFinancieros:(rucEmpresa, liquidacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/LiquidacionPagoFinancSet?$filter=IDRuc eq '${rucEmpresa}' and IDLiquidacion eq '${liquidacionId}'`;

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
                            metodo: 'getLiquidacionPagosFinancieros',
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
    getLiquidacionDescuentoFepPDF: (rucEmpresa, documentoId, ejercicio) =>{
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`,
                "Content-Type":'application/xml'
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/AdjuntoFepSet?$filter=IDDocumento eq '${documentoId}' and IDEjercicio eq '${ejercicio}' and IDRuc eq '${rucEmpresa}'`;
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
                            metodo: 'getLiquidacionDescuentoFepPDF',
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
    getAdelantosEmbarcaciones: (rucEmpresa) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/AdelantoLinCredSet?$filter=IDRuc eq '${rucEmpresa}'`;

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
                            metodo: 'getAdelantosEmbarcaciones',
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
    getAdelantoEmbarcacion: (rucEmpresa, embarcacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/AdelantoLinCredSet?$filter=IDRuc eq '${rucEmpresa}' and Embarcacion eq '${embarcacionId}'`;

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

                        resolve(jObj.feed.entry.content['m:properties']);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getAdelantoEmbarcacion',
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
    getDetalleAdelantosEmbarcacion: (rucEmpresa, embarcacion, fechaInicio, fechaFin) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/AdelantoRegSet?$filter=IDRuc eq '${rucEmpresa}' and Embarcacion eq '${embarcacion}'`;
            if(fechaInicio && fechaFin)
                finalUrl = finalUrl + `and (FechaInicio eq '${fechaInicio}') and (FechaFin eq '${fechaFin}')`;
            
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
                            metodo: 'getDetalleAdelantosEmbarcacion',
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
    getDetalleAdelantosPagos: (rucEmpresa, adelantoId, ejercicio, posicion) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/AdelantoRegDetSet?$filter=IDRuc eq '${rucEmpresa}' and IDAdelanto eq '${adelantoId}' and Ejercicio eq '${ejercicio}' and Posicion eq '${posicion}'`;
            
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
                            metodo: 'getDetalleAdelantosPagos',
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
    getDescuentosEmbarcacion: (rucEmpresa, embarcacion) =>{
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/AdelantoLinCredDetSet?$filter=IDRuc eq '${rucEmpresa}' and Embarcacion eq '${embarcacion}'`;
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
                            metodo: 'getDescuentosEmbarcacion',
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
    getDescuentosEmbarcacionDetalle: (rucEmpresa, embarcacion, tipoDescuento) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/AdelantoDescuentoDetSet?$filter=IDRuc eq '${rucEmpresa}' and Embarcacion eq '${embarcacion}'`;
            if(tipoDescuento){
                finalUrl += ` and TipoDescuento eq '${tipoDescuento}'`;
            }
            
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
                            metodo: 'getDescuentosEmbarcacionDetalle',
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
    getTemporadas: () => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/TemporadaSet?$filter=IDEspecie eq '01' and IDTipo eq 'ADELTEMP'`;

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
                            metodo: 'getTemporadas',
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
    getTiposMoneda: () => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/TipoMonedaSet`;

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
                            metodo: 'getTiposMoneda',
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
    getTiposViaPago: (rucEmpresa) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/TipoViaPagoSet?$filter=IDRuc eq '${rucEmpresa}'`;

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
                            metodo: 'getTiposViaPago',
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
    getTipoViaPago: (rucEmpresa, id) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/TipoViaPagoSet?$filter=IDRuc eq '${rucEmpresa}' and IDViaPago eq '${id}'`;

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

                        resolve(jObj.feed.entry.content['m:properties']);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getTipoViaPago',
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
    getTiposPlanta: () => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/TipoPlantaSet`;

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
                            metodo: 'getTiposPlanta',
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
    getTipoPlanta: (id) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/TipoPlantaSet?$filter=IDPlanta eq '${id}'`;

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

                        resolve(jObj.feed.entry.content['m:properties']);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getTipoPlanta',
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
    getTiposEmbarcacion: (rucEmpresa) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/TipoEmbarcacionSet?$filter=IDRuc eq '${rucEmpresa}'`;

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
                            metodo: 'getTiposEmbarcacion',
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
    getTipoEmbarcacion: (rucEmpresa, id) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/TipoEmbarcacionSet?$filter=IDRuc eq '${rucEmpresa}' and IDEmbarcacion eq '${id}'`;
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

                        if(Array.isArray(jObj.feed.entry)){
                            resolve(jObj.feed.entry[0].content['m:properties']);
                        }else{
                            resolve(jObj.feed.entry.content['m:properties']);
                        }
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getTipoEmbarcacion',
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
    getHabilitacionesEmbarcaciones: (rucEmpresa) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/HabilitacionLinCredSet?$filter=IDRuc eq '${rucEmpresa}'`;

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
                            metodo: 'getHabilitacionesEmbarcaciones',
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
    getHabilitacionEmbarcacion: (rucEmpresa, embarcacionId) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/HabilitacionLinCredSet?$filter=IDRuc eq '${rucEmpresa}' and Embarcacion eq '${embarcacionId}'`;

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
                        resolve(jObj.feed.entry.content['m:properties']);
                    }else{
                        reject({
                            objeto:CLASE,
                            metodo: 'getHabilitacionEmbarcacion',
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
    getDetalleHabilitacionesEmbarcacion: (rucEmpresa, embarcacion, fechaInicio, fechaFin) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/HabilitacionRegSet?$filter=IDRuc eq '${rucEmpresa}' and Embarcacion eq '${embarcacion}'`;
            if(fechaInicio && fechaFin)
                finalUrl = finalUrl + `and (FechaInicio eq '${fechaInicio}') and (FechaFin eq '${fechaFin}')`;
            
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
                            metodo: 'getDetalleHabilitacionesEmbarcacion',
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
    getDetalleHabilitacionesPagos: (rucEmpresa, adelantoId, ejercicio, posicion) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/HabilitacionRegDetSet?$filter=IDRuc eq '${rucEmpresa}' and IDHabilitacion eq '${adelantoId}' and Ejercicio eq '${ejercicio}' and Posicion eq '${posicion}'`;
            
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
                            metodo: 'getDetalleHabilitacionesPagos',
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
    getDatosArmador: (rucEmpresa) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/DatosArmadorSet?$filter=IDRuc eq '${rucEmpresa}'`;
            
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
                            metodo: 'getDatosArmador',
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
    getCuentasBancariasArmador:(rucEmpresa) => {
        return new Promise ( async (resolve, reject) =>{
            let userPassword = config.app.module.sapRISE.username+":"+config.app.module.sapRISE.password;
            let buff = new Buffer.from(userPassword);
            let userPassword64data = buff.toString('base64');

            const headers = {
                'Authorization': `Basic ${userPassword64data}`
            };

            var finalUrl = `${config.app.module.sapRISE.odataURL}${CLASE}/DatosCuentasSet?$filter=IDRuc eq '${rucEmpresa}'`;

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
                            metodo: 'getCuentasBancariasArmador',
                            statusCode:result.statusCode,
                            statusMessage:result.statusMessage,
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

    }
};