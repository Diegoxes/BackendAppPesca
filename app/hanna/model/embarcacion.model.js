'use strict';

var queryList = `select LIFNR, MATRICULA, NAME1, LIFN2 from "SAPABAP1"."ZCDSFI_001_002" limit 10`;
var queryListByName = `select LIFNR, MATRICULA, NAME1, LIFN2 from "SAPABAP1"."ZCDSFI_001_002" WHERE UPPER(NAME1) like ?`;
var queryListByMatricula = `select LIFNR, MATRICULA, NAME1, LIFN2 from "SAPABAP1"."ZCDSFI_001_002" WHERE LIFNR LIKE ?`;
var queryListByNameOrMatricula = `select LIFNR, MATRICULA, NAME1, LIFN2 from "SAPABAP1"."ZCDSFI_001_002" WHERE UPPER(NAME1) LIKE ? OR LIFNR LIKE ?`;
var queryListPorArmador = `select LIFNR, MATRICULA, NAME1, LIFN2 from "SAPABAP1"."ZCDSFI_001_002" WHERE LIFN2 = ?`;
var queryListPorArmadorRuc = `SELECT TB1.LIFNR, TB1.MATRICULA, TB1.NAME1, TB1.LIFN2 
                                FROM "SAPABAP1"."ZCDSFI_001_002" TB1
                                JOIN "SAPABAP1"."ZCDSFI_001_001" TB2 ON TB1.LIFN2 = TB2.PARTNER
                                WHERE TB2.TAXNUM = ?`;
var queryValidarPorArmadorRucYCodigo = `SELECT TB1.LIFNR, TB1.MATRICULA, TB1.NAME1, TB1.LIFN2 
                                FROM "SAPABAP1"."ZCDSFI_001_002" TB1
                                JOIN "SAPABAP1"."ZCDSFI_001_001" TB2 ON TB1.LIFN2 = TB2.PARTNER
                                WHERE TB2.TAXNUM = ?
                                AND TB1.MATRICULA = ?`;

exports.queryList = queryList;
exports.queryListByName = queryListByName;
exports.queryListByMatricula = queryListByMatricula;
exports.queryListByNameOrMatricula = queryListByNameOrMatricula;
exports.queryListPorArmador = queryListPorArmador;
exports.queryListPorArmadorRuc = queryListPorArmadorRuc;
exports.queryValidarPorArmadorRucYCodigo = queryValidarPorArmadorRucYCodigo;