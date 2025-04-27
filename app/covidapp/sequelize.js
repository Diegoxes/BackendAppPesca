'use strict';

const Sequelize = require('sequelize');
const database = require('../../config/database');
const logger = require('../../util/basic-logger');

const sequelize = new Sequelize(database.dbCovidApp.database,
        database.dbCovidApp.username,
        database.dbCovidApp.password,
        database.dbCovidApp.params);

var model = {};

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);
  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
};

sequelize.authenticate()
        .then(() => {
          var msj = "Conección con BD establecida: " + database.dbCovidApp.database;
          console.log(msj);
          logger.info(msj);
        })
        .catch(err => {
          var msj = "No se pudo establecer conección con BD: " + database.dbCovidApp.database;
          console.log(msj);
          logger.error(msj);
          logger.error(err);
        });

        exports.sequelize=sequelize

/*
 * Modelos para el esquema generico
 */

const TipoDocumentoModel = require('./model/tipo.documento.model');
const TipoDocumento      = TipoDocumentoModel(sequelize, Sequelize);
model['TipoDocumento']   = TipoDocumento;

const TipoCuentaModel = require('./model/tipo.cuenta.model');
const TipoCuenta      = TipoCuentaModel(sequelize, Sequelize);
model['TipoCuenta']   = TipoCuenta;

const UsuarioModel = require('./model/usuario.model');
const Usuario      = UsuarioModel(sequelize, Sequelize);
model['Usuario']   = Usuario;

const ModuloModel = require('./model/modulo.model');
const Modulo      = ModuloModel(sequelize, Sequelize);
model['Modulo']   = Modulo;

const TipoCuentaModuloModel = require('./model/tipo.cuenta.modulo.model');
const TipoCuentaModulo      = TipoCuentaModuloModel(sequelize, Sequelize);
model['TipoCuentaModulo']   = TipoCuentaModulo;

const UsuarioModuloModel = require('./model/usuario.modulo.model');
const UsuarioModulo      = UsuarioModuloModel(sequelize, Sequelize, model);
model['UsuarioModulo']   = UsuarioModulo;

const LogAccesoModel = require('./model/log.acceso.model');
const LogAcceso      = LogAccesoModel(sequelize, Sequelize);
model['LogAcceso']   = LogAcceso;

const DescargaMpModel = require('./model/descarga.mp.model');
const DescargaMp      = DescargaMpModel(sequelize, Sequelize);
model['DescargaMp']   = DescargaMp;

const DescargaMpImagenModel = require('./model/descarga.mp.imagen.model');
const DescargaMpImagen      = DescargaMpImagenModel(sequelize, Sequelize);
model['DescargaMpImagen']   = DescargaMpImagen;

const DescargaMpVideoModel = require('./model/descarga.mp.video.model');
const DescargaMpVideo      = DescargaMpVideoModel(sequelize, Sequelize);
model['DescargaMpVideo']   = DescargaMpVideo;

const DescargaMpDocumentoModel = require('./model/descarga.mp.documento.model');
const DescargaMpDocumento      = DescargaMpDocumentoModel(sequelize, Sequelize);
model['DescargaMpDocumento']   = DescargaMpDocumento;


const DespachoCombustibleModel = require('./model/despacho.combustible.model');
const DespachoCombustible      = DespachoCombustibleModel(sequelize, Sequelize);
model['DespachoCombustible']   = DespachoCombustible;

const DespachoCombustibleImagenModel = require('./model/despacho.combustible.imagen.model');
const DespachoCombustibleImagen      = DespachoCombustibleImagenModel(sequelize, Sequelize);
model['DespachoCombustibleImagen']   = DespachoCombustibleImagen;

const DespachoCombustibleVideoModel = require('./model/despacho.combustible.video.model');
const DespachoCombustibleVideo      = DespachoCombustibleVideoModel(sequelize, Sequelize);
model['DespachoCombustibleVideo']   = DespachoCombustibleVideo;

const ResiduosSolidosModel = require('./model/residuos.solidos.model');
const ResiduosSolidos      = ResiduosSolidosModel(sequelize, Sequelize);
model['ResiduosSolidos']   = ResiduosSolidos;

const ResiduosSolidosImagenModel = require('./model/residuos.solidos.imagen.model');
const ResiduosSolidosImagen      = ResiduosSolidosImagenModel(sequelize, Sequelize);
model['ResiduosSolidosImagen']   = ResiduosSolidosImagen;

const PlantaModel = require('./model/planta.model');
const Planta      = PlantaModel(sequelize, Sequelize);
model['Planta']   = Planta;

const ChataModel = require('./model/chata.model');
const Chata      = ChataModel(sequelize, Sequelize);
model['Chata']   = Chata;

const TolvaModel = require('./model/tolva.model');
const Tolva      = TolvaModel(sequelize, Sequelize);
model['Tolva']   = Tolva;

const TurnoInformeModel = require('./model/turno.informe.model');
const TurnoInforme      = TurnoInformeModel(sequelize, Sequelize);
model['TurnoInforme']   = TurnoInforme;

const SolicitudTurnoModel = require('./model/turno.solicitud.model');
const SolicitudTurno      = SolicitudTurnoModel(sequelize, Sequelize);
model['SolicitudTurno']   = SolicitudTurno;

const TurnoPlantaGeocercaModel = require('./model/turno.planta.geocerca.model');
const TurnoPlantaGeocerca      = TurnoPlantaGeocercaModel(sequelize, Sequelize);
model['TurnoPlantaGeocerca']   = TurnoPlantaGeocerca;

const ZonaPescaZonasModel = require('./model/zona.pesca.zonas.model');
const ZonaPescaZonas = ZonaPescaZonasModel(sequelize, Sequelize);
model['ZonaPescaZonas'] = ZonaPescaZonas;

const ZonaPescaReferenciaModel = require('./model/zona.pesca.referencia.model');
const ZonaPescaReferencia = ZonaPescaReferenciaModel(sequelize, Sequelize);
model['ZonaPescaReferencia'] = ZonaPescaReferencia;

const ZonaPescaZonasReferenciaModel = require('./model/zona.pesca.zonas.referencia.model');
const ZonaPescaZonasReferencia = ZonaPescaZonasReferenciaModel(sequelize, Sequelize);
model['ZonaPescaZonasReferencia'] = ZonaPescaZonasReferencia;

const UsuarioAceptacionTerminosModel = require('./model/usuario.aceptacion.terminos.model');
const UsuarioAceptacionTerminos = UsuarioAceptacionTerminosModel(sequelize, Sequelize);
model['UsuarioAceptacionTerminos'] = UsuarioAceptacionTerminos;

const UsuarioMotivoEliminacionModel = require('./model/usuario.motivo.eliminacion.model');
const UsuarioMotivoEliminacion = UsuarioMotivoEliminacionModel(sequelize, Sequelize);
model['UsuarioMotivoEliminacion'] = UsuarioMotivoEliminacion;

const ComunicadoModel = require('./model/comunicado.model');
const Comunicado = ComunicadoModel(sequelize, Sequelize);
model['Comunicado'] = Comunicado;

const ComunicadoViewModel = require('./model/comunicado.view.model');
const ComunicadoView = ComunicadoViewModel(sequelize, Sequelize, model);
model['ComunicadoView'] = ComunicadoView;

const WorkflowTemplateModel = require('./model/workflow.template.model');
const WorkflowTemplate = WorkflowTemplateModel(sequelize, Sequelize, model);
model['WorkflowTemplate'] = WorkflowTemplate;

const WorkflowTemplateAprobadorModel = require('./model/workflow.template.aprobador.model');
const WorkflowTemplateAprobador = WorkflowTemplateAprobadorModel(sequelize, Sequelize, model);
model['WorkflowTemplateAprobador'] = WorkflowTemplateAprobador;

const WorkflowAprobacionModel = require('./model/workflow.aprobacion.model');
const WorkflowAprobacion = WorkflowAprobacionModel(sequelize, Sequelize, model);
model['WorkflowAprobacion'] = WorkflowAprobacion;

const WorkflowAprobacionAprobadorModel = require('./model/workflow.aprobacion.aprobador.model');
const WorkflowAprobacionAprobador = WorkflowAprobacionAprobadorModel(sequelize, Sequelize, model);
model['WorkflowAprobacionAprobador'] = WorkflowAprobacionAprobador;

const WorkflowAprobacionSapIdsModel = require('./model/workflow.aprobacion.sapIds.model');
const WorkflowAprobacionSapIds = WorkflowAprobacionSapIdsModel(sequelize, Sequelize, model);
model['WorkflowAprobacionSapIds'] = WorkflowAprobacionSapIds;

const TemporadaModel=require('./model/temporada.model');
const Temporada=TemporadaModel(sequelize,Sequelize,model);
model['Temporada']=Temporada

const UsuarioEmpresasModel=require('./model/usuario.empresas.model');
const UsuarioEmpresas=UsuarioEmpresasModel(sequelize,Sequelize,model);
model['UsuarioEmpresas']=UsuarioEmpresas

const TemplateUsuarioEmpresasModel=require('./model/workflow.template.usuario.empresas.model');
const TemplateUsuarioEmpresas=TemplateUsuarioEmpresasModel(sequelize,Sequelize,model);
model['TemplateUsuarioEmpresas']=TemplateUsuarioEmpresas

const WorkflowAprobacionUsuarioEmpresasModel=require('./model/workflow.aprobacion.usuario.empresas.model');
const WorkflowAprobacionUsuarioEmpresas=WorkflowAprobacionUsuarioEmpresasModel(sequelize,Sequelize,model);
model['WorkflowAprobacionUsuarioEmpresasModel']=WorkflowAprobacionUsuarioEmpresas

const WorkflowAprobacionAprobadorUsuarioEmpresasModel=require('./model/workflow.aprobacion.aprobador.usuario.empresas.model');
const WorkflowAprobacionAprobadorUsuarioEmpresas=WorkflowAprobacionAprobadorUsuarioEmpresasModel(sequelize,Sequelize,model);
model['WorkflowAprobacionAprobadorUsuarioEmpresasModel']=WorkflowAprobacionAprobadorUsuarioEmpresas

//Asociaciones
Object.keys(model).forEach(name => {
  if (model[name].associate) {
    model[name].associate(model);
  }
});

module.exports = model;
