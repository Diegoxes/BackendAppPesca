'use strict';

var queryMiTurmo = `SELECT TOP 1 TB_ZTPP_TD.MANDT,
                            TB_ZTPP_TD.BUKRS,
                            TB_ZTPP_TD.WERKS,
                            TB_ZTPP_TD.FECHA_DESC,
                            TB_ZTPP_TD.CORRELATIVO,
                            TB_ZTPP_TD.TURNO,
                            TB_ZTPP_TD.NUM_MATR,
                            TB_ZTPP_TD.MATRICULA,
                            TB_ZTPP_TD.NOMB_EMB,
                            TB_ZTPP_TD.MATR_SAP,
                            TB_ZTPP_TD.LIFN2,
                            TB_ZTPP_TD.NOMB_ARM,
                            TB_ZTPP_TD.TAXNUM,
                            TB_ZTPP_TD.ESTADO,
                            TB_T001W.NAME1 AS PLANTA_NOMBRE,
                            'miTurno' AS TIPO_TURNO
                    FROM "SAPABAP1"."ZTPP_TURNO_DESC" AS TB_ZTPP_TD
                    JOIN "SAPABAP1"."T001W" AS TB_T001W ON TB_ZTPP_TD.MANDT = TB_T001W.MANDT AND TB_ZTPP_TD.WERKS = TB_T001W.WERKS
                    WHERE TB_ZTPP_TD.ESTADO IN ('01','02')
                    AND TB_ZTPP_TD.MANDT = '300'
                    AND TB_ZTPP_TD.BUKRS = 'HDKP'
                    AND MATRICULA = ?`;
exports.queryMiTurmo = queryMiTurmo;

var queryTurnoActual = `SELECT TOP 1 TB_ZTPP_TD.MANDT,
                              TB_ZTPP_TD.BUKRS,
                              TB_ZTPP_TD.WERKS,
                              TB_ZTPP_TD.FECHA_DESC,
                              TB_ZTPP_TD.CORRELATIVO,
                              TB_ZTPP_TD.TURNO,
                              TB_ZTPP_TD.NUM_MATR,
                              TB_ZTPP_TD.MATRICULA,
                              TB_ZTPP_TD.NOMB_EMB,
                              TB_ZTPP_TD.MATR_SAP,
                              TB_ZTPP_TD.LIFN2,
                              TB_ZTPP_TD.NOMB_ARM,
                              TB_ZTPP_TD.TAXNUM,
                              TB_ZTPP_TD.ESTADO,
                              TB_T001W.NAME1 AS PLANTA_NOMBRE,
                      	      'turnoActual' AS TIPO_TURNO
                      FROM "SAPABAP1"."ZTPP_TURNO_DESC" AS TB_ZTPP_TD
                      JOIN "SAPABAP1"."T001W" AS TB_T001W ON TB_ZTPP_TD.MANDT = TB_T001W.MANDT AND TB_ZTPP_TD.WERKS = TB_T001W.WERKS
                      WHERE TB_ZTPP_TD.ESTADO = '02'
                      AND TB_ZTPP_TD.MANDT = '300'
                      AND TB_ZTPP_TD.BUKRS = 'HDKP'
                      AND TB_ZTPP_TD.WERKS = ?
                      AND TB_ZTPP_TD.FECHA_DESC = ?
                      ORDER BY TB_ZTPP_TD.TURNO DESC`;
exports.queryTurnoActual = queryTurnoActual;

var queryTurnoPrevioSiguiente = `SELECT *
                                        FROM (
                                                SELECT TOP 1 TB_ZTPP_TD.MANDT,
                                                        TB_ZTPP_TD.BUKRS,
                                                        TB_ZTPP_TD.WERKS,
                                                        TB_ZTPP_TD.FECHA_DESC,
                                                        TB_ZTPP_TD.CORRELATIVO,
                                                        TB_ZTPP_TD.TURNO,
                                                        TB_ZTPP_TD.NUM_MATR,
                                                        TB_ZTPP_TD.MATRICULA,
                                                        TB_ZTPP_TD.NOMB_EMB,
                                                        TB_ZTPP_TD.MATR_SAP,
                                                        TB_ZTPP_TD.LIFN2,
                                                        TB_ZTPP_TD.NOMB_ARM,
                                                        TB_ZTPP_TD.TAXNUM,
                                                        TB_ZTPP_TD.ESTADO,
                                                        TB_T001W.NAME1 AS PLANTA_NOMBRE,
                                                        'turnoPrevio' AS TIPO_TURNO
                                                FROM "SAPABAP1"."ZTPP_TURNO_DESC" AS TB_ZTPP_TD
                                                JOIN "SAPABAP1"."T001W" AS TB_T001W ON TB_ZTPP_TD.MANDT = TB_T001W.MANDT AND TB_ZTPP_TD.WERKS = TB_T001W.WERKS
                                                WHERE TB_ZTPP_TD.TURNO < ?
                                                AND TB_ZTPP_TD.WERKS = ?
                                                AND TB_ZTPP_TD.FECHA_DESC = ?
                                                AND TB_ZTPP_TD.MANDT = '300'
                                                AND TB_ZTPP_TD.BUKRS = 'HDKP'
                                                AND TB_ZTPP_TD.ESTADO = '03'
                                                ORDER BY TB_ZTPP_TD.TURNO DESC
                                        ) AS TB1
                                        UNION
                                        SELECT *
                                        FROM (SELECT TOP 1 TB_ZTPP_TD.MANDT,
                                                TB_ZTPP_TD.BUKRS,
                                                TB_ZTPP_TD.WERKS,
                                                TB_ZTPP_TD.FECHA_DESC,
                                                TB_ZTPP_TD.CORRELATIVO,
                                                TB_ZTPP_TD.TURNO,
                                                TB_ZTPP_TD.NUM_MATR,
                                                TB_ZTPP_TD.MATRICULA,
                                                TB_ZTPP_TD.NOMB_EMB,
                                                TB_ZTPP_TD.MATR_SAP,
                                                TB_ZTPP_TD.LIFN2,
                                                TB_ZTPP_TD.NOMB_ARM,
                                                TB_ZTPP_TD.TAXNUM,
                                                TB_ZTPP_TD.ESTADO,
                                                TB_T001W.NAME1 AS PLANTA_NOMBRE,
                                                'turnoSiguiente' AS TIPO_TURNO
                                        FROM "SAPABAP1"."ZTPP_TURNO_DESC" AS TB_ZTPP_TD
                                        JOIN "SAPABAP1"."T001W" AS TB_T001W ON TB_ZTPP_TD.MANDT = TB_T001W.MANDT AND TB_ZTPP_TD.WERKS = TB_T001W.WERKS
                                        WHERE TB_ZTPP_TD.TURNO > ?
                                        AND TB_ZTPP_TD.WERKS = ?
                                        AND TB_ZTPP_TD.FECHA_DESC = ?
                                        AND TB_ZTPP_TD.MANDT = '300'
                                        AND TB_ZTPP_TD.BUKRS = 'HDKP'
                                        AND TB_ZTPP_TD.ESTADO = '01'
                                        ORDER BY TB_ZTPP_TD.TURNO ASC) AS TB2`;

exports.queryTurnoPrevioSiguiente = queryTurnoPrevioSiguiente;

var queryTurnoSiguiente =  `SELECT TOP 1 TB_ZTPP_TD.FECHA_DESC,
                          TB_ZTPP_TD.TURNO,
                          TB_ZTPP_TD.NUM_MATR,
                          TB_ZTPP_TD.MATRICULA,
                          TB_ZTPP_TD.NOMB_EMB,
                          TB_ZTPP_TD.MATR_SAP,
                          TB_ZTPP_TD.LIFN2,
                          TB_ZTPP_TD.NOMB_ARM,
                          TB_ZTPP_TD.TAXNUM,
                          TB_ZTPP_TD.ESTADO,
                          TB_T001W.NAME1 AS PLANTA_NOMBRE,
                          TB_ZCDSFI.SMTP_ADDR,
                          'turnoSiguiente' AS TIPO_TURNO
                  FROM "SAPABAP1"."ZTPP_TURNO_DESC" AS TB_ZTPP_TD
                  LEFT JOIN "SAPABAP1"."T001W" AS TB_T001W ON TB_ZTPP_TD.MANDT = TB_T001W.MANDT AND TB_ZTPP_TD.WERKS = TB_T001W.WERKS
                  LEFT JOIN "SAPABAP1"."ZCDSFI_001_001" TB_ZCDSFI ON TB_ZTPP_TD.LIFN2 = TB_ZCDSFI.PARTNER
                  WHERE TB_ZTPP_TD.ESTADO = '01'
                  AND TB_ZTPP_TD.TURNO = @turno
                  AND TB_ZTPP_TD.FECHA_DESC = '@fechaDescarga'
                  AND TB_ZTPP_TD.WERKS = '@codPlanta'
                  AND TB_ZTPP_TD.MANDT = '300'
                  AND TB_ZTPP_TD.BUKRS = 'HDKP'
                  AND TB_ZTPP_TD.ESTADO = '1'`
exports.queryTurnoSiguiente = queryTurnoSiguiente;

var queryTurnoPlanta = `SELECT TB_ZTPP_TD.MANDT,
                            TB_ZTPP_TD.BUKRS,
                            TB_ZTPP_TD.WERKS,
                            TB_ZTPP_TD.FECHA_DESC,
                            TB_ZTPP_TD.CORRELATIVO,
                            TB_ZTPP_TD.TURNO,
                            TB_ZTPP_TD.NUM_MATR,
                            TB_ZTPP_TD.MATRICULA,
                            TB_ZTPP_TD.NOMB_EMB,
                            TB_ZTPP_TD.MATR_SAP,
                            TB_ZTPP_TD.LIFN2,
                            TB_ZTPP_TD.NOMB_ARM,
                            TB_ZTPP_TD.TAXNUM,
                            TB_ZTPP_TD.ESTADO,
                            TB_T001W.NAME1 AS PLANTA_NOMBRE,
                            '' AS TIPO_TURNO
                    FROM "SAPABAP1"."ZTPP_TURNO_DESC" AS TB_ZTPP_TD
                    JOIN "SAPABAP1"."T001W" AS TB_T001W ON TB_ZTPP_TD.MANDT = TB_T001W.MANDT AND TB_ZTPP_TD.WERKS = TB_T001W.WERKS
                    WHERE TB_ZTPP_TD.MANDT = '300'
                    AND TB_ZTPP_TD.WERKS = '@codPlanta'
                    AND TB_ZTPP_TD.FECHA_DESC = '@fechaDescarga'
                    AND TB_ZTPP_TD.ESTADO != '09'
                    ORDER BY TB_ZTPP_TD.TURNO ASC`;

exports.queryTurnoPlanta = queryTurnoPlanta;


var queryHANAEmbarcTieneTurno = `SELECT TOP 1 *
                        FROM "SAPABAP1"."ZTPP_TURNO_DESC" AS TB_ZTPP_TD
                        WHERE WERKS = ?
                        AND FECHA_DESC = ?
                        AND MATRICULA = ?
                        AND ESTADO IN ('01', '02')`;

exports.queryHANAEmbarcTieneTurno = queryHANAEmbarcTieneTurno;

