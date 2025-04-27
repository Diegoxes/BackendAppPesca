'use strict';

var queryGetPorInformeFlota = `select TB1.NUMINF,
                                    TB1.WERDES,
                                    TB1.NAME1,
                                    TB1.ARMADOR,
                                    TB1.FULL_NAME,
                                    TB1.TAXNUM,
                                    TB1.MATR_SAP,
                                    TB1.EMBARC,
                                    TB1.MATRICULA,
                                    TB1.COD_MATR,
                                    TB2.SMTP_ADDR,
                                    TB2.TEL_NUMBER,
                                    TB2.TELNR_LONG
                            from "SAPABAP1"."ZCDSFI_001_003" AS TB1 JOIN "SAPABAP1"."ZCDSFI_001_001" TB2 ON TB1.ARMADOR = TB2.PARTNER
                            where TB1.NUMINF = ?`;
exports.queryGetPorInformeFlota = queryGetPorInformeFlota;

var queryGetPorMatricula = `select TB1.NUMINF,
                            TB1.WERDES,
                            TB1.NAME1,
                            TB1.ARMADOR,
                            TB1.FULL_NAME,
                            TB1.TAXNUM,
                            TB1.MATR_SAP,
                            TB1.EMBARC,
                            TB1.MATRICULA,
                            TB2.SMTP_ADDR,
                            TB2.TEL_NUMBER,
                            TB2.TELNR_LONG
                            from "SAPABAP1"."ZCDSFI_001_003" AS TB1 JOIN "SAPABAP1"."ZCDSFI_001_001" TB2 ON TB1.ARMADOR = TB2.PARTNER
                            where TB1.MATR_SAP = ? ORDER BY TB1.NUMINF DESC LIMIT 1`;
exports.queryGetPorMatricula = queryGetPorMatricula;
