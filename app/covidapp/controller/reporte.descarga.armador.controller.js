'use strict';
const awaitErrorHandlerFactory = require('../../../util/error-handler');
const poolDBHana = require('../../../db/connectionDBHana');
const logger = require('../../../util/basic-logger');
const config = require('../../../config/config');
const util = require('../../../util/util');
const constants = require('../../../config/constants');

const redisCovidapp = require("../../../db/connectionRedisCovidapp")

const armadorModel = require('../../hanna/model/armador.model');
const embarcacionModel = require('../../hanna/model/embarcacion.model');
const reporteDecargaModel = require('../../hanna/model/reporte.descarga.model');

const seguridadController = require("./seguridad.controller");
const reporteDescargasOData=require("../sap_odata/ZCDSPP_REPORTE_DESCARGA")

const odataEmbarcacion=require("../sap_odata/ZCDSFI_307_EMB_ARMADOR")

var listDescargas = awaitErrorHandlerFactory(async (req, res, next) => {

    var arrModulosIds= ['covidapp-reporte-reporteDescargas'];
    if(!await seguridadController.validarAccesoUsuarioModulo(req,res,false,arrModulosIds)){
        return;
    }

    var token = req.headers.authorization.split(" ")[1];
    var resultToken = util.verifyJWTAuthToken(token);

    var armadorRuc = req.query.armadorRuc;
    var embarcacion = req.query.embarcacion;
    var planta = req.query.planta;
    var temporada = req.query.temporada;

    if(resultToken.tipoCuentaId == 'ARM' || resultToken.tipoCuentaId == 'BAH'){
        armadorRuc = resultToken.rucEmpresa;
    }

    // var resultValidarEmbarcacionArmadorSAP = await poolDBHana.executeQuery(embarcacionModel.queryValidarPorArmadorRucYCodigo, [armadorRuc, embarcacion]);
    var resultValidarEmbarcacionArmadorSAP=await odataEmbarcacion.getEmbarcacionPorArmadorRucYCodigo({armadorRuc,embarcacion});
    var formatResultSap=resultValidarEmbarcacionArmadorSAP.d.results.map(({ __metadata, ...rest }) => rest);

    if(formatResultSap.length == 1){
        var matricula = null;
        var matriculaSplit = formatResultSap[0].MATRICULA;
        matriculaSplit = matriculaSplit.split("-");
        if(matriculaSplit.length == 1){
            matricula = matriculaSplit[0]
        }else if(matriculaSplit.length >1){
            matricula = matriculaSplit[1];
        }

        if(matricula != null){
            var resultReporte = [];
            if(planta === '-1'){ //TODAS LAS PLANTAS
                // resultReporte = await poolDBHana.executeQuery(reporteDecargaModel.queryHANAReporteDescarga1, [matricula, temporada]);
                resultReporte=await reporteDescargasOData.getReporteDescarga({matricula,temporada});
                
            }else{//FILTRAMOS POR PLANTA
                // resultReporte = await poolDBHana.executeQuery(reporteDecargaModel.queryHANAReporteDescarga2, [matricula, planta, temporada]);
                resultReporte=await reporteDescargasOData.getReporteDescarga({matricula,temporada,planta});
            }

            let  resultado=resultReporte.d.results

            if (resultado.length == 0) {
                res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, []));
                return;
            }

            var resultArray = [];
            for (var i = 0; i < resultado.length; i++) {
                var data = {
                    temporada : resultado[i].__metadata.temporada,
                    region : resultado[i].region,
                    fecha : resultado[i].fecha,
                    informeFlota : resultado[i].informe_flota,
                    tipoInforme : resultado[i].tipo_informe,
                    matricula : resultado[i].matricula,
                    embarcacion : resultado[i].embarcacion,
                    pesca : resultado[i].pesca,
                    destino : resultado[i].destino,
                    centro : resultado[i].centro,
                    id_centro : resultado[i].id_centro,
                    puertoArribo : resultado[i].puerto_arribo,
                    capTm : resultado[i].cap_tm,
                    cantidadDeclarada : resultado[i].cantidad_declarada,
                    cantidadEntregada : resultado[i].cantidad_entregada,
                    eficienciaBodega : resultado[i].eficiencia_bodega,
                    rangoEficienciaBodega : resultado[i].rango_eficiencia_bodega,
                    desDec : resultado[i].des_dec,
                    difDesDec : resultado[i].dif_des_dec,
                    fechaIniCala : resultado[i].fecha_ini_cala,
                    horaIniCala: resultado[i].hora_ini_cala,
                    tdcArribo : resultado[i].tdc_arribo,
                    tbvnChata : resultado[i].tbvn_chata,
                    tdc : resultado[i].tdc,
                    tde : resultado[i].tde,
                    fechaArriboPuerto : resultado[i].fecha_arribo_puerto,
                    horaArriboPuerto : resultado[i].hora_arribo_puerto,
                    fechaInicioDescarga : resultado[i].fecha_inicio_descarga,
                    horaInicioDescarga : resultado[i].hora_inicio_descarga,
                    fechaFinDescarga : resultado[i].fecha_fin_descarga,
                    horaFinDescarga : resultado[i].hora_fin_descarga,
                    ppEspecieAcompanante : resultado[i].pp_especie_acompanante,
                    porcAcompanante : resultado[i].porc_acompanante,
                    porcJuveniles : resultado[i].porc_juveniles,
                    tbvn : resultado[i].tbvn,
                    qmCalPotMp : resultado[i].qm_cal_pot_mp,
                    ppChata : resultado[i].pp_chata,
                    qmDestrozo : resultado[i].qm_destrozo,
                    lado : resultado[i].lado,
                    agrupador : resultado[i].agrupador,
                    nomGrupo : resultado[i].nom_grupo,
                    motivoDemora : resultado[i].motivo_demora,
                    motivoParadaPlanta : resultado[i].motivo_parada_planta,
                    motivoParadaChata : resultado[i].motivo_parada_chata,
                    motivoParadaEmbarcacion : resultado[i].motivo_parada_embarcacion,
                    tdeRango : resultado[i].tde_rango
                };

                resultArray.push(data);
            }
                         
            res.json(util.jsonResponse(constants.CODIGO.SERVIDOR.EXITO, null, resultArray));
        }else{
            res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
            res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_NO_PROCESADO, "No se pudo validar la embarcación. Disculpe las molestias.", null));
            return;
        }
    }else{
        res.status(constants.CODIGO.SERVIDOR.ERROR_APP);
        res.json(util.jsonResponse(constants.CODIGO.APLICACION.ERROR_NO_PROCESADO, "No se pudo validar la embarcación. Disculpe las molestias.", null));
        return;
    }

    
 
});
exports.listDescargas = listDescargas;