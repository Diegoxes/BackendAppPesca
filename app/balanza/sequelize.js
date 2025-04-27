'use strict';

const Sequelize = require('sequelize');
const database = require('../../config/database');
const logger = require('../../util/basic-logger');

const sequelize = new Sequelize(database.dbHayduk.database,
        database.dbHayduk.username,
        database.dbHayduk.password,
        database.dbHayduk.params);

var model = {};

sequelize.authenticate()
        .then(() => {
          var msj = "Conección con BD establecida: " + database.dbHayduk.database;
          console.log(msj);
          logger.info(msj);
        })
        .catch(err => {
          var msj = "No se pudo establecer conección con BD: " + database.dbHayduk.database;
          console.log(msj);
          logger.error(msj);
          logger.error(err);
        });

        /*
         * Modelos para el esquema generico
         */

const OcrTicketTolvaPescaModel = require('./model/ocr.ticket.tolva.pesca.model');
const OcrTicketTolvaPesca = OcrTicketTolvaPescaModel(sequelize, Sequelize);
model['OcrTicketTolvaPesca'] = OcrTicketTolvaPesca;

//Asociaciones
Object.keys(model).forEach(name => {
  if (model[name].associate) {
    model[name].associate(model);
  }
});

module.exports = model;
