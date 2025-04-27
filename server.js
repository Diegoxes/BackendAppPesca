'use strict';

const util = require('./util/util');
const setTZ = require('set-tz');
setTZ('America/Lima');
const morgan=require("morgan")
const express = require('express'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      compression = require('compression');

const fileUpload = require('express-fileupload');

const config = require('./config/config'),
      constants = require('./config/constants'),
      logger = require('./util/basic-logger');

var io = require('@pm2/io');

var meter = io.meter({
  name      : 'req/min',
  samples   : 1,
  timeframe : 60
});




const app = express();
app.use(morgan('dev'));
app.use(compression());
app.use(bodyParser.json({limit: '300mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '300mb', extended: true}));



app.use(cors());
app.use(fileUpload());

app.use('/', express.static('./doc/'));
app.use('/doc/', express.static('./doc/'));





app.use(function(req, res, next){
  meter.mark();

  var arrExcludeUrl = [
    '/covidapp/general/tipoDocumento',
    '/covidapp/general/tipoCuenta',
    '/covidapp/seguridad/sigin',
    '/covidapp/seguridad/login',
    '/covidapp/seguridad/recoverPassword',
    '/covidapp/seguridad/existsEmail',
    '/covidapp/seguridad/tokenEmbeddedApp',
    '/covidapp/seguridad/loginEmbeddedApp',
    '/covidapp/seguridad/registrarArmador',
    '/covidapp/seguridad/solicitarDeleteAccount'
  ];

  if(arrExcludeUrl.indexOf(req.originalUrl) >= 0){
    next();
  }else{
    if(req.originalUrl == '/covidapp/seguridad/renew'){
      next();
    }else if(req.originalUrl.indexOf("/covidapp/operaciones/descargaMp/descargarImagen") >= 0 ||
      req.originalUrl.indexOf("/covidapp/operaciones/descargaMp/descargarVideo") >= 0 ||
      req.originalUrl.indexOf("/covidapp/operaciones/despachoCombustible/descargarImagen") >= 0 ||
      req.originalUrl.indexOf("/covidapp/operaciones/despachoCombustible/descargarVideo") >= 0 ||
      req.originalUrl.indexOf("/covidapp/operaciones/residuosSolidos/descargarImagen") >= 0 ||
      req.originalUrl.indexOf("/covidapp/mipesca/descargaMp/descargarImagen") >= 0 ||
      req.originalUrl.indexOf("/covidapp/mipesca/descargaMp/descargarVideo") >= 0 ||
      req.originalUrl.indexOf("/covidapp/mipesca/despachoCombustible/descargarImagen") >= 0 ||
      req.originalUrl.indexOf("/covidapp/mipesca/despachoCombustible/descargarVideo") >= 0 ||
      req.originalUrl.indexOf("/covidapp/mipesca/residuosSolidos/descargarImagen") >= 0 ||
      req.originalUrl.indexOf("/covidapp/liquidacion/descargarLiquidacion") >= 0 ||
      req.originalUrl.indexOf("/covidapp/liquidacion/descargarLiquidacionDescuentoFep") >= 0
    ){
      next();
    }else{
     try{
        var token = req.headers.authorization.split(" ")[1];
        util.verifyJWTAuthToken(token);
        next();
      }catch(e){
          res.status(constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED);
          res.json(util.jsonResponse(constants.MENSAJE.SERVIDOR.ERROR_UNAUTHORIZED,
            constants.CODIGO.SERVIDOR.ERROR_UNAUTHORIZED, null));
      }
         
    }
  }
});

//Generamos la rutas de Covidapp
try{
  const indexData = require('./app/covidapp/index');
  indexData.initRoutes(app);

  const indexBalanza = require('./app/balanza/index');
  indexBalanza.initRoutes(app);

  const indexHanna = require('./app/hanna/index');
  indexHanna.initRoutes(app);

}catch(err){
  logger.error(err);
}

//HTTP SERVER (NGIX SSL PRODUCTION)

const server = app.listen(config.app.port, function () {
  console.log('Listening on port ' + config.app.port);
  logger.info('Listening on port ' + config.app.port);
}).on('error', function (err) {
  logger.error(err);
});


//QA
/*
const https = require('https');
const fs = require('fs');

// we will pass our 'app' to 'https' server
https.createServer({
  key: fs.readFileSync('C:/SSLs/apache2/hdkeurekabi2.key'),
  cert: fs.readFileSync('C:/SSLs/apache2/hdkeurekabi2.crt')
}, app)
.listen(3001);

*/
