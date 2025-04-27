'use strict';

var queryList = `select PARTNER, NAME1, TAXNUM, SMTP_ADDR, TEL_NUMBER, TELNR_LONG from "SAPABAP1"."ZCDSFI_001_001" LIMIT 10`;
var queryListByName = `select PARTNER, NAME1, TAXNUM, SMTP_ADDR, TEL_NUMBER, TELNR_LONG from "SAPABAP1"."ZCDSFI_001_001" WHERE UPPER(NAME1) like ?`;
var queryListByRuc = `select PARTNER, NAME1, TAXNUM, SMTP_ADDR, TEL_NUMBER, TELNR_LONG from "SAPABAP1"."ZCDSFI_001_001" WHERE TAXNUM = ?`;
var queryListByNameOrRuc = `select PARTNER, NAME1, TAXNUM, SMTP_ADDR, TEL_NUMBER, TELNR_LONG from "SAPABAP1"."ZCDSFI_001_001" WHERE UPPER(NAME1) LIKE ? OR TAXNUM LIKE ?`;
var queryGet = `select PARTNER, NAME1, TAXNUM, SMTP_ADDR, TEL_NUMBER, TELNR_LONG from "SAPABAP1"."ZCDSFI_001_001" WHERE PARTNER = ? LIMIT 1`;

exports.queryList = queryList;
exports.queryListByName = queryListByName;
exports.queryListByRuc = queryListByRuc;
exports.queryListByNameOrRuc = queryListByNameOrRuc;
exports.queryGet = queryGet;
