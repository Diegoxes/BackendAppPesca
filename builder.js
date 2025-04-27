var octo = require('@octopusdeploy/octopackjs');
var fs = require('fs');

octo.pack('zip')
  .append('app/**')
  .append('config/auth.apps.json')
  .append('config/constants.js')
  .append('config/config.js',fs.createReadStream('config/0-prod-config.js'))
  .append('config/database.js',fs.createReadStream('config/0-prod-database.js'))
  .append('config/private.key',fs.createReadStream('config/0-prod-private.key'))
  .append('config/public.key',fs.createReadStream('config/0-prod-public.key'))
  .append('data')
  .append('db/**')
  .append('lib/**')
  .append('logs')
  .append('templates/**')
  .append('util/**')
  .append('server.js')
  .append('ecosystem.config.js')
  .append('package.json')
  .toFile('./dist', function (err, data) {
    console.log("Package Saved: "+ data.name);
  });