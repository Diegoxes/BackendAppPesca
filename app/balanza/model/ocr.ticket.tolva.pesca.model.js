const config = require('../../../config/config');
module.exports = (sequelize, type) => {
  var tabla = 'OCR_Ticket_Tolva_Pesca';
  if(!config.production)
    tabla +="_Dev";

  var OcrTicketTolvaPesca = sequelize.define(tabla, {
    id: {
      field: 'Id',
      primaryKey: true,
      type: type.INTEGER,
      allowNull: false,
      required: true,
      autoIncrement: true,
      comment: "Id"
    },
    plantaId: {
      field: 'Id_Planta',
      type: type.STRING(4),
      allowNull: true,
      required: false,
      comment: "Planta"
    },
    fechaHoraInicio: {
      field: 'fecha_hora_inicio',
      type: type.DATE,
      allowNull: true,
      required: false,
      comment: "Fecha y Hora de inicio"
    },
    fechaHoraFin: {
      field: 'fecha_hora_fin',
      type: type.DATE,
      allowNull: true,
      required: false,
      comment: "Fecha y Hora de fin"
    },
    ticketFecha: {
      field: 'ticket_fecha',
      type: type.DATE,
      allowNull: true,
      required: false,
      comment: "Fecha de registro"
    },
    nroMatricula:{
      field: 'nro_matricula',
      type: type.STRING(15),
      allowNull: true,
      required: false,
      comment: "Matricula de la embarcacion"
    },
    especie:{
      field: 'especie',
      type: type.INTEGER,
      allowNull: true,
      required: false,
      comment: "especie 1->ANCHOVETA"
    },
    nroPesadas:{
      field: 'nro_pesadas',
      type: type.DECIMAL,
      allowNull: true,
      required: false,
      comment: "Nro de Batchs"
    },
    pesoAcumulado:{
      field: 'peso_acumulado',
      type: type.DECIMAL,
      allowNull: true,
      required: false,
      comment: "Peso total"
    },
    nroTolva:{
      field: 'nro_tolva',
      type: type.INTEGER,
      allowNull: true,
      required: false,
      comment: "Nro de tolva"
    },
    nroReporte:{
      field: 'nro_reporte',
      type: type.STRING(6),
      allowNull: true,
      required: false,
      comment: "numero de reporte"
    },
    informeFlota:{
      field: 'informe_flota',
      type: type.STRING(12),
      allowNull: true,
      required: false,
      comment: "informeFlota"
    },
    pathImagen:{
      field: 'path_imagen',
      type: type.STRING(255),
      allowNull: true,
      required: false,
      comment: "path imagen hayduk contigo"
    }

  }, {
    freezeTableName: true,
    schema: 'dbo',
    timestamps: false
  });

  OcrTicketTolvaPesca.associate = function(models) {

  };

  return OcrTicketTolvaPesca;
};
