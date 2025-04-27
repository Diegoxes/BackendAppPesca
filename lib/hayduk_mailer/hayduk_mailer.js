'use strict';
const request = require('request');
const fs = require('fs');

const SERVICE_URL = 'http://mailerapp.haydukcorporacion.com.pe/api/'

module.exports = {
    authenticate: (username, password) => {
        return new Promise((resolve, reject) => {
            const headers = {
                'Content-Type': 'application/json'
            };

            const dataJSON = {
                username: username,
                password: password
            };

            request.post({
                url: `${SERVICE_URL}seguridad/auth` ,
                body: JSON.stringify(dataJSON),
                headers: headers
            }, (err, result, body) => {
                if (err){
                  console.log(err);
                  return reject(err);  
                }

                try {
                    var bodyJSON = JSON.parse(body);
                    resolve(bodyJSON.data);
                } catch (e) {
                    reject(err);
                }
            });

        });
    },
    uploadAttachments: (accessToken, attachments = []) => {
        return new Promise(async (resolve, reject) => {
            var headers = {};

            var formData = {};
            if(attachments){
                if(attachments.length > 0){
                    for(var i=0; i<attachments.length; i++){
                        if(typeof attachments[i].filepath !== 'undefined'){
                            formData[`file${i+1}`] = {
                                value:await getFile(attachments[i].filepath),
                                options: {
                                    filename: attachments[i].filename,
                                }
                            }
                        }else if(typeof attachments[i].value !== 'undefined'){
                            formData[`file${i+1}`] = {
                                value: attachments[i].value,
                                options: {
                                    filename: attachments[i].filename,
                                }
                            }
                        }
                    }
                }
            }else{
                reject('No attachments detected');
                return;
            }
            request.post({
                url: `${SERVICE_URL}smtp/attachment` ,
                auth:{
                    bearer:accessToken.aT
                },
                formData:formData,
                headers: headers
            }, (err, result, body) => {
                if (err){
                  console.log(err);
                  return reject(err);  
                }

                try {
                    var bodyJSON = JSON.parse(body);
                    resolve(bodyJSON.data);
                } catch (e) {
                    reject(err);
                }
            });
            
        });
    },
    sendEmail: (accessToken, from, to, type = 'html', asunto, mensaje, cc = null, cco = null, attachments = [], replyTo = null) => {
        return new Promise((resolve, reject) => {
            const headers = {
                'Content-Type': 'application/json'
            };
            const dataJSON = {
                from: from,
                to: to,
                type:type,
                asunto:asunto, 
                mensaje:mensaje
            };

            if(cc)dataJSON.cc = cc;
            if(cco)dataJSON.cco = cco;
            if(attachments)dataJSON.attachments = attachments;
            if(replyTo)dataJSON.replyTo = replyTo;
            
            request.post({
                url: `${SERVICE_URL}smtp/send` ,
                auth: {
                    bearer:accessToken.aT
                },
                body: JSON.stringify(dataJSON),
                headers: headers
            }, (err, result, body) => {
                if (err){
                  console.log(err);
                  return reject(err);  
                }

                try {
                    var bodyJSON = JSON.parse(body);
                    if(bodyJSON.code === 200){
                        resolve(bodyJSON.data);
                        return;
                    }else{
                        reject(bodyJSON);
                        return;
                    }
                } catch (e) {
                    reject(null);
                }
            });

        });
    },
    readEmail: (accessToken, from, folder = 'INBOX', markSeen = true, searchCriteria = ['UNSEEN']) => {
        return new Promise((resolve, reject) => {
            const headers = {
                'Content-Type': 'application/json'
            };

            const dataJSON = {
                from: from,
                folder: folder,
                markSeen:markSeen,
                searchCriteria:searchCriteria
            };

            request.get({
                url: `${SERVICE_URL}imap/list` ,
                auth: {
                    bearer:accessToken.aT
                },
                body: JSON.stringify(dataJSON),
                headers: headers
            }, (err, result, body) => {
                if (err){
                  console.log(err);
                  return reject(err);  
                }

                try {
                    var bodyJSON = JSON.parse(body);
                    resolve(bodyJSON.data);
                } catch (e) {
                    reject(null);
                }
            });

        });
    }
};

var getFile = (fileURL) => {
    return new Promise((resolve, reject) =>{
        try{
            fs.readFile(fileURL, (err, data) => {
                if (err) {
                  console.error(err);
                  reject(err);
                }
                resolve(data);
              });
        }catch(err){
            reject(err);
        }
    }); 
}