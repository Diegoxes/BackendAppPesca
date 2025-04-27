"use strict";
const path = require("path");
const sep = path.sep;

module.exports = {
  production: false,
  bcrypt: {
    saltRounds: 10,
  },
  crypto: {
    algorithm: "aes-256-ctr",
    password: "XC&%4t*Az3BnyapW",
  },
  jwt: {
    tokenTime: 86400, //3600, // 1 HORA
    permanentTokenTime: 86400, // 1 SEMANA
    renewTokenTime: 172800, // 24 HORAS
    tokenTimeEmbededdApp: 1800, //1800, // 1/2 HORA
  },
  redis: {
    dbHaydukContigo: {
      port: 6379, // Redis port
      host: "127.0.0.1", // Redis host
      family: 4, // 4 (IPv4) or 6 (IPv6)
      password: "Hayduk2020aaaa",
      db: 0,
    },
  },
  email: {
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    username: "haydukcontigo@hayduk.com.pe",
    password: "Tjvw75.46*",
    toErrorOCRTicketBalanza: "mavellaneda@hayduk.com.pe, mgavellanedab@yahoo.es",
    toSolicitudBajaCuenta: "mavellaneda@hayduk.com.pe"
  },
  azureStorage: {
    accountName: "haydukcontigo",
    accountKey: "rem38ypigcOukCVXu+leqYJ3MZiIrTcP19b0SBWzQpG51x9Ce6fTpmxsMT3uDGIaApYdxYZWoU15+ztmaa0L8Q==",
    blobURL: "DefaultEndpointsProtocol=https;AccountName=haydukcontigo;AccountKey=rem38ypigcOukCVXu+leqYJ3MZiIrTcP19b0SBWzQpG51x9Ce6fTpmxsMT3uDGIaApYdxYZWoU15+ztmaa0L8Q==;EndpointSuffix=core.windows.net",
    containerName: "cn-haydukcontigo-dev",
    url: "https://haydukcontigo.blob.core.windows.net/",
    descargaMpDirectory: "descargamp",
    despachoCombustibleDirectory: "despachocombustible",
    residuosSolidosDirectory: "residuossolidos",
    imagenesDirectory: "imagenes",
    videosDirectory: "videos",
    documentosDirectory: "documentos",
    comunicadosDirectory: "comunicados"
  },
  azureFormRecognizer: {
    ticketBalanzaOCR: {
      endpoint: "https://ocr-tickets-balanza.cognitiveservices.azure.com/",
      key1: "40825177712545d2bf0545925e21194f",
      modelId: "model_ticket_balanza_v23",
    },
  },
  recaptcha: {
    secretKey: "6LfHRDMgAAAAAHwyGcjpR5Bowu7CStLAib-y7ou_",
  },
  app: {
    name: "hk-covidapp-be",
    port: 9096,
    module: {
      seguridad: {
        registroUsuario:{
          cco: 'ggonzales@hayduk.com.pe, acuadros@hayduk.com.pe'
        },
        crypto: {
          algorithm: "aes-256-cbc",
          key: {
            type: "Buffer",
            data: [
              8, 229, 128, 196, 147, 8, 91, 239, 211, 174, 253, 73, 0, 100, 71,
              120, 197, 37, 248, 147, 1, 10, 137, 235, 22, 185, 84, 231, 211,
              108, 131, 195,
            ],
          },
        },
      },
      residuosSolidos: {
        temporalMediaPath: "data" + sep + "residuosSolidos" + sep + "temporal",
        imagePath: "data" + sep + "residuosSolidos" + sep + "images",
        videosPath: "data" + sep + "residuosSolidos" + sep + "videos",
      },
      descargaMp: {
        temporalMediaPath: "data" + sep + "descargaMp" + sep + "temporal",
        imagePath: "data" + sep + "descargaMp" + sep + "images",
        videosPath: "data" + sep + "descargaMp" + sep + "videos",
        nms: {
          urlRMTP: "rtmp://192.168.1.11",
          portRMTP: "10935",
          urlWS: "ws://192.168.1.11",
          portWS: "8081",
          channelPrefix: "/live/DMP-SM-",
          key: "brsJgLlI3Go1E1Jnq4NJDut7hKpT2gLz1vj3DhnEOGFqrPzNBWBTWB73t4yk63mNiGtMfZWMjJMdhRiU",
        },
      },
      despachoCombustible: {
        temporalMediaPath:
          "data" + sep + "despachoCombustible" + sep + "temporal",
        imagePath: "data" + sep + "despachoCombustible" + sep + "images",
        videosPath: "data" + sep + "despachoCombustible" + sep + "videos",
      },
      politicaCompliance: {
        filename:'Politica_Compliance_Corporativo_Version 07.pdf',
        email:{
          cco:'mavellaneda@hayduk.com.pe',
        }
      },
      s4hana:{
        /*odataURL:'http://hdks4appprd.hayduk.com.pe:50000/sap/opu/odata/sap/',
        username:'usr_interfac',
        password:'Lima3000'
        */
        odataURL:'http://hdks4appqas.hayduk.com.pe:50000/sap/opu/odata/sap/',
        username:'usr_interfac',
        password:'Lima3000'
        
      },
      sapRISE:{
        odataURL:'https://vhpqhqs4ci.sap.haydukcorporacion.com.pe:44300/sap/opu/odata/sap/',
        username:'usr_interfac',
        password:'Lima3000030000++'
      },
      haydukServicesProxy:{
        rucHayduk:'20136165667',
        url:'http://192.168.0.9/HaydukServiceProxy/ServiceProxy.asmx?WSDL',
        username:'admin',
        password:'H4yduk2015'
      },
      solicitudesWorkflowEmail: {
        correos: [
          { userEmail: "consultordev@hayduk.com.pe",nombresApellidos:"Diego Mendoza" },
          // { userEmail: "mavellaneda@hayduk.com.pe" },
          // { userEmail: "dmendoza@ispconsulting.com.pe" }
        ]
      },
      EmailForErrors:{
        correosError:[
          // {userEmail:"mavellaneda@hayduk.com.pe"},
          {userEmail:"consultordev@hayduk.com.pe",nombresApellidos:"Diego Mendoza"}
        ]
      },
      EmailForReject:{
        correosRechazo:[
          {userEmail:"consultordev@hayduk.com.pe",nombresApellidos:"Diego Mendoza"},
          // {userEmail:"mavellaneda@hayduk.com.pe"},
        ]
      }
      ,
    },
  },
};
