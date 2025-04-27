'use strict';

const request = require('request');

const NAMESPACE_POWERBI_API = 'https://analysis.windows.net/powerbi/api';
const SERVICE_AUTH2_TOKEN = 'https://login.windows.net/common/oauth2/token';
const SERVICE_URL = 'https://api.powerbi.com/v1.0/myorg';
const SERVICE_URL_GROUPS = '/groups';
const SERVICE_URL_GROUPS_USERS = '/users';
const SERVICE_URL_REPORTS = '/reports';
const SERVICE_URL_DASHBORDS = '/dashboards';

module.exports = {
  getAccessToken: function(clientId, username, password){
    return new Promise(function (resolve, reject) {
      const headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
      };
      
      const formData = {
        grant_type: 'password',
        scope: 'openid', 
        resource: NAMESPACE_POWERBI_API,
        client_id: clientId,
        username: username,
        password: password
      };
      
      request.post({
        url: SERVICE_AUTH2_TOKEN,
        form: formData,
        headers: headers
      }, function (err, result, body) {
        if (err) return reject(err);
        try{
          resolve(JSON.parse(body));
        }catch(e){
          reject(err);
        }
      });
    });
  },
  
  getGroups: function(accessToken){
    return new Promise(function (resolve, reject) {
      const authToken = accessToken.token_type + " " + accessToken.access_token;
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authToken,
        'Cache-Control': 'no-cache'
      };
      
      const formData = {
        accessLevel: 'view'
      };
      
      request.get({
        url: SERVICE_URL + SERVICE_URL_GROUPS,
        form: formData,
        headers: headers
      }, function (err, result, body) {
        if (err) return reject(err);
        try{
          resolve(JSON.parse(body));
        }catch(e){
          reject(err);
        }
      });
    });
  },
  
  getUsersByGroup: function(accessToken, groupId){
    return new Promise(function (resolve, reject) {
      const authToken = accessToken.token_type + " " + accessToken.access_token;
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authToken,
        'Cache-Control': 'no-cache'
      };
      
      const formData = {
        accessLevel: 'view'
      };
      
      request.get({
        url: SERVICE_URL + SERVICE_URL_GROUPS + "/" + groupId + "/" + SERVICE_URL_GROUPS_USERS,
        form: formData,
        headers: headers
      }, function (err, result, body) {
        if (err) return reject(err);
        try{
          resolve(JSON.parse(body));
        }catch(e){
          reject(err);
        }
      });
    });
  },
  
  getReports: function(accessToken, groupId){
    return new Promise(function (resolve, reject) {
      const authToken = accessToken.token_type + " " + accessToken.access_token;
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authToken,
        'Cache-Control': 'no-cache'
      };
      
      const formData = {
        accessLevel: 'view'
      };
      
      var url = SERVICE_URL + SERVICE_URL_REPORTS;
      if(groupId)
        url = SERVICE_URL + SERVICE_URL_GROUPS + "/" + groupId + "/" + SERVICE_URL_REPORTS;
            
      request.get({
        url: url,
        form: formData,
        headers: headers
      }, function (err, result, body) {
        if (err) return reject(err);
        try{
          resolve(JSON.parse(body));
        }catch(e){
          reject(err);
        }
      });
    });
  },
  
  getDashboards: function(accessToken, groupId){
    return new Promise(function (resolve, reject) {
      const authToken = accessToken.token_type + " " + accessToken.access_token;
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authToken,
        'Cache-Control': 'no-cache'
      };
      
      const formData = {
        accessLevel: 'view'
      };
      
      var url = SERVICE_URL + SERVICE_URL_DASHBORDS;
      if(groupId)
        url = SERVICE_URL + SERVICE_URL_GROUPS + "/" + groupId + "/" + SERVICE_URL_DASHBORDS;
            
      request.get({
        url: url,
        form: formData,
        headers: headers
      }, function (err, result, body) {
        if (err) return reject(err);
        try{
          resolve(JSON.parse(body));
        }catch(e){
          reject(err);
        }
      });
    });
  }
};