var queryHANAReporteDescarga1 = `WITH CTE_INFORME_FLOTA AS(
	SELECT 	 TEMPORADA
			,CASE IDREGION
				WHEN  '01' THEN 'ANCHOVETA N + C'
				WHEN  '02' THEN 'ANCHOVETA SUR'
			 ELSE '' END AS REGION
			,FECDES2 AS FECHA
			,A.INFORME_FLOTA
			,TIPO_INFORME
			,MATRICULA
			,EMBARCACION
			,PESCA
			,DESTINO
			,(SELECT NAME2 FROM SAPABAP1.t001w WHERE (SELECT WERDES FROM SAPABAP1.ZTPP_INFOR_FLOTA WHERE A.INFORME_FLOTA = NUMINF) = WERKS) AS CENTRO
			,(SELECT WERDES FROM SAPABAP1.ZTPP_INFOR_FLOTA WHERE A.INFORME_FLOTA = NUMINF) AS ID_CENTRO
			,PUERTO_ARRIBO
			,CAP_TM
			,CANTIDAD_DECLARADA
			,CANTIDAD_ENTREGADA
			,TO_DECIMAL(EFICIENCIA_BODEGA,18,3) AS EFICIENCIA_BODEGA
			,CASE 
				WHEN EFICIENCIA_BODEGA < 0.5    THEN '<50%'
				WHEN EFICIENCIA_BODEGA >= 0.5 
					AND EFICIENCIA_BODEGA < 0.8 THEN '>=50% - <80%'
				WHEN EFICIENCIA_BODEGA >= 0.8   THEN '>=80%'
			 ELSE '' END AS RANGO_EFICIENCIA_BODEGA
		    ,TO_DECIMAL((-1 + DES_DEC),10,3) AS DES_DEC
			,CASE
				WHEN  (-1 + DES_DEC)  <= -0.1 THEN '->= 10%'
			 ELSE '< 10%' END AS DIF_DES_DEC
			 -- TIEMPOS
			,B.FECHA_INI_CALA
			,B.HORA_INI_CALA
			,SECONDS_BETWEEN(B.FECHA_HORA_INI_CALA, ConvertDatetime(FECARRI, HORARRI))/3600 AS TDC_ARRIBO
			,TO_DECIMAL( NULLIF(C.TBVN_CHATA, '') ) AS TBVN_CHATA
			,SECONDS_BETWEEN(B.FECHA_HORA_INI_CALA, ConvertDatetime(FECDES1,HORDES1))/3600 AS TDC
			,SECONDS_BETWEEN(ConvertDatetime(FECARRI, HORARRI), ConvertDatetime(FECDES1, HORDES1))/3600 AS TDE
			,FECARRI FECHA_ARRIBO_PUERTO
			,HORARRI HORA_ARRIBO_PUERTO
			,FECDES1 FECHA_INICIO_DESCARGA
			,HORDES1 HORA_INICIO_DESCARGA
			,FECDES2 FECHA_FIN_DESCARGA
			,HORDES2 HORA_FIN_DESCARGA
			-- CARACTERISTICAS
			,PP_ESPECIE_ACOMPANANTE
			,TO_DECIMAL(NULLIF(PP_ESPECIE_INCIDENT,''), 18, 3) AS PORC_ACOMPANANTE
			,TO_DECIMAL(NULLIF(QM_JUVENILES,''), 18, 3) AS PORC_JUVENILES
			,TO_DECIMAL(NULLIF(TBVN,''),18,3) AS TBVN
			,QM_CAL_POT_MP
			,PP_CHATA
			,TO_DECIMAL(
				NULLIF(
					   (SELECT MAX(CASE WHEN ATNAM = 'QM_DESTROZO' THEN VALOR_UNICO ELSE '' END)
					    FROM SAPABAP1.ZCDSPP00104_02 
					    WHERE ATNAM = 'QM_DESTROZO' 
					    AND LOTE_OF_OC = MATERIAL_LOTE
					    )
				   		,'')
			 ,18,3 ) AS QM_DESTROZO
			,LADO
	        ,AGRUPADOR
	        ,NOM_GRUPO
	        ,(SELECT MAX(MO_DE_CAM_EMB)  FROM SAPABAP1.ZTPP_INFO_DESCAR WHERE SAPABAP1.ZTPP_INFO_DESCAR.NUMINF = A.INFORME_FLOTA ) AS MOTIVO_DEMORA
			,(SELECT MAX(MO_PAR_X_PLTA)  FROM SAPABAP1.ZTPP_INFO_DESCAR WHERE SAPABAP1.ZTPP_INFO_DESCAR.NUMINF = A.INFORME_FLOTA ) AS MOTIVO_PARADA_PLANTA
			,(SELECT MAX(MO_PAR_X_CHTA)  FROM SAPABAP1.ZTPP_INFO_DESCAR WHERE SAPABAP1.ZTPP_INFO_DESCAR.NUMINF = A.INFORME_FLOTA ) AS MOTIVO_PARADA_CHATA
			,(SELECT MAX(MO_PAR_X_EMBAR) FROM SAPABAP1.ZTPP_INFO_DESCAR WHERE SAPABAP1.ZTPP_INFO_DESCAR.NUMINF = A.INFORME_FLOTA ) AS MOTIVO_PARADA_EMBARCACION
	FROM SAPABAP1.ZCDSACHI002 A 
	LEFT JOIN (
		SELECT   NUMINF
		         ,ConvertDatetime(FECCAL1,HORCAL1) FECHA_HORA_INI_CALA
				 ,FECCAL1 AS FECHA_INI_CALA
				 ,HORCAL1 AS HORA_INI_CALA
			  	 ,ROW_NUMBER() OVER(PARTITION BY NUMINF ORDER BY NUMCALA ASC) ORDEN_CALA
		FROM SAPABAP1.ZTPP_CALAS
		WHERE TBODE > 0
		AND DATS_IS_VALID(FECCAL1) = 1  
	) B ON A.INFORME_FLOTA = B.NUMINF
		AND B.ORDEN_CALA = 1
	LEFT JOIN (
		SELECT 	INFORME_FLOTA
			   ,CA_21 AS TBVN_CHATA
		FROM SAPABAP1.ZTBPP_LOTEH 
		WHERE TIPO_REG = '01'
		AND POS = 1 
	) C ON A.INFORME_FLOTA = C.INFORME_FLOTA
	WHERE FECDES2 >= ( SELECT FEC_INIC
						FROM(
							SELECT 	 FEC_INIC
									,ROW_NUMBER() OVER(PARTITION BY IDREGION ORDER BY FEC_INIC DESC) AS NTEMPORADAS 
							FROM SAPABAP1.ZTPP_TEMP_PESCA
							WHERE IDREGION = '01'
						)WHERE NTEMPORADAS = 8 )
	AND TEMPORADA IS NOT NULL
), CTE_TDE AS (
	SELECT   A.*
			,CASE
				WHEN A.TDE >= 0  AND A.TDE <= 3  THEN '0-3'
				WHEN A.TDE > 3   AND A.TDE <= 6  THEN '3-6'
				WHEN A.TDE > 6   AND A.TDE <= 9  THEN '6-9'
				WHEN A.TDE > 9   AND A.TDE <= 12 THEN '9-12'
				WHEN A.TDE > 12  AND A.TDE <= 15 THEN '12-15'
				WHEN A.TDE > 15  AND A.TDE <= 18 THEN '15-18'
				WHEN A.TDE > 18  AND A.TDE <= 21 THEN '18-21'
				WHEN A.TDE > 21  AND A.TDE <= 24 THEN '21-24'
				WHEN A.TDE > 24  AND A.TDE <= 27 THEN '24-27'
				WHEN A.TDE > 27 THEN '>27'
			 ELSE '' END AS TDE_RANGO			
	FROM CTE_INFORME_FLOTA A
) SELECT *
  FROM CTE_TDE TB1
  WHERE TB1.MATRICULA = ?
  AND TB1.TEMPORADA = ?
  ORDER BY TB1.FECHA DESC
`;
exports.queryHANAReporteDescarga1 = queryHANAReporteDescarga1;

var queryHANAReporteDescarga2 = `WITH CTE_INFORME_FLOTA AS(
	SELECT 	 TEMPORADA
			,CASE IDREGION
				WHEN  '01' THEN 'ANCHOVETA N + C'
				WHEN  '02' THEN 'ANCHOVETA SUR'
			 ELSE '' END AS REGION
			,FECDES2 AS FECHA
			,A.INFORME_FLOTA
			,TIPO_INFORME
			,MATRICULA
			,EMBARCACION
			,PESCA
			,DESTINO
			,(SELECT NAME2 FROM SAPABAP1.t001w WHERE (SELECT WERDES FROM SAPABAP1.ZTPP_INFOR_FLOTA WHERE A.INFORME_FLOTA = NUMINF) = WERKS) AS CENTRO
			,(SELECT WERDES FROM SAPABAP1.ZTPP_INFOR_FLOTA WHERE A.INFORME_FLOTA = NUMINF) AS ID_CENTRO
			,PUERTO_ARRIBO
			,CAP_TM
			,CANTIDAD_DECLARADA
			,CANTIDAD_ENTREGADA
			,TO_DECIMAL(EFICIENCIA_BODEGA,18,3) AS EFICIENCIA_BODEGA
			,CASE 
				WHEN EFICIENCIA_BODEGA < 0.5    THEN '<50%'
				WHEN EFICIENCIA_BODEGA >= 0.5 
					AND EFICIENCIA_BODEGA < 0.8 THEN '>=50% - <80%'
				WHEN EFICIENCIA_BODEGA >= 0.8   THEN '>=80%'
			 ELSE '' END AS RANGO_EFICIENCIA_BODEGA
		    ,TO_DECIMAL((-1 + DES_DEC),10,3) AS DES_DEC
			,CASE
				WHEN  (-1 + DES_DEC)  <= -0.1 THEN '->= 10%'
			 ELSE '< 10%' END AS DIF_DES_DEC
			 -- TIEMPOS
			,B.FECHA_INI_CALA
			,B.HORA_INI_CALA
			,SECONDS_BETWEEN(B.FECHA_HORA_INI_CALA, ConvertDatetime(FECARRI, HORARRI))/3600 AS TDC_ARRIBO
			,TO_DECIMAL( NULLIF(C.TBVN_CHATA, '') ) AS TBVN_CHATA
			,SECONDS_BETWEEN(B.FECHA_HORA_INI_CALA, ConvertDatetime(FECDES1,HORDES1))/3600 AS TDC
			,SECONDS_BETWEEN(ConvertDatetime(FECARRI, HORARRI), ConvertDatetime(FECDES1, HORDES1))/3600 AS TDE
			,FECARRI FECHA_ARRIBO_PUERTO
			,HORARRI HORA_ARRIBO_PUERTO
			,FECDES1 FECHA_INICIO_DESCARGA
			,HORDES1 HORA_INICIO_DESCARGA
			,FECDES2 FECHA_FIN_DESCARGA
			,HORDES2 HORA_FIN_DESCARGA
			-- CARACTERISTICAS
			,PP_ESPECIE_ACOMPANANTE
			,TO_DECIMAL(NULLIF(PP_ESPECIE_INCIDENT,''), 18, 3) AS PORC_ACOMPANANTE
			,TO_DECIMAL(NULLIF(QM_JUVENILES,''), 18, 3) AS PORC_JUVENILES
			,TO_DECIMAL(NULLIF(TBVN,''),18,3) AS TBVN
			,QM_CAL_POT_MP
			,PP_CHATA
			,TO_DECIMAL(
				NULLIF(
					   (SELECT MAX(CASE WHEN ATNAM = 'QM_DESTROZO' THEN VALOR_UNICO ELSE '' END)
					    FROM SAPABAP1.ZCDSPP00104_02 
					    WHERE ATNAM = 'QM_DESTROZO' 
					    AND LOTE_OF_OC = MATERIAL_LOTE
					    )
				   		,'')
			 ,18,3 ) AS QM_DESTROZO
			,LADO
	        ,AGRUPADOR
	        ,NOM_GRUPO
	        ,(SELECT MAX(MO_DE_CAM_EMB)  FROM SAPABAP1.ZTPP_INFO_DESCAR WHERE SAPABAP1.ZTPP_INFO_DESCAR.NUMINF = A.INFORME_FLOTA ) AS MOTIVO_DEMORA
			,(SELECT MAX(MO_PAR_X_PLTA)  FROM SAPABAP1.ZTPP_INFO_DESCAR WHERE SAPABAP1.ZTPP_INFO_DESCAR.NUMINF = A.INFORME_FLOTA ) AS MOTIVO_PARADA_PLANTA
			,(SELECT MAX(MO_PAR_X_CHTA)  FROM SAPABAP1.ZTPP_INFO_DESCAR WHERE SAPABAP1.ZTPP_INFO_DESCAR.NUMINF = A.INFORME_FLOTA ) AS MOTIVO_PARADA_CHATA
			,(SELECT MAX(MO_PAR_X_EMBAR) FROM SAPABAP1.ZTPP_INFO_DESCAR WHERE SAPABAP1.ZTPP_INFO_DESCAR.NUMINF = A.INFORME_FLOTA ) AS MOTIVO_PARADA_EMBARCACION
	FROM SAPABAP1.ZCDSACHI002 A 
	LEFT JOIN (
		SELECT   NUMINF
		         ,ConvertDatetime(FECCAL1,HORCAL1) FECHA_HORA_INI_CALA
				 ,FECCAL1 AS FECHA_INI_CALA
				 ,HORCAL1 AS HORA_INI_CALA
			  	 ,ROW_NUMBER() OVER(PARTITION BY NUMINF ORDER BY NUMCALA ASC) ORDEN_CALA
		FROM SAPABAP1.ZTPP_CALAS
		WHERE TBODE > 0
		AND DATS_IS_VALID(FECCAL1) = 1  
	) B ON A.INFORME_FLOTA = B.NUMINF
		AND B.ORDEN_CALA = 1
	LEFT JOIN (
		SELECT 	INFORME_FLOTA
			   ,CA_21 AS TBVN_CHATA
		FROM SAPABAP1.ZTBPP_LOTEH 
		WHERE TIPO_REG = '01'
		AND POS = 1 
	) C ON A.INFORME_FLOTA = C.INFORME_FLOTA
	WHERE FECDES2 >= ( SELECT FEC_INIC
						FROM(
							SELECT 	 FEC_INIC
									,ROW_NUMBER() OVER(PARTITION BY IDREGION ORDER BY FEC_INIC DESC) AS NTEMPORADAS 
							FROM SAPABAP1.ZTPP_TEMP_PESCA
							WHERE IDREGION = '01'
						)WHERE NTEMPORADAS = 8 )
	AND TEMPORADA IS NOT NULL
), CTE_TDE AS (
	SELECT   A.*
			,CASE
				WHEN A.TDE >= 0  AND A.TDE <= 3  THEN '0-3'
				WHEN A.TDE > 3   AND A.TDE <= 6  THEN '3-6'
				WHEN A.TDE > 6   AND A.TDE <= 9  THEN '6-9'
				WHEN A.TDE > 9   AND A.TDE <= 12 THEN '9-12'
				WHEN A.TDE > 12  AND A.TDE <= 15 THEN '12-15'
				WHEN A.TDE > 15  AND A.TDE <= 18 THEN '15-18'
				WHEN A.TDE > 18  AND A.TDE <= 21 THEN '18-21'
				WHEN A.TDE > 21  AND A.TDE <= 24 THEN '21-24'
				WHEN A.TDE > 24  AND A.TDE <= 27 THEN '24-27'
				WHEN A.TDE > 27 THEN '>27'
			 ELSE '' END AS TDE_RANGO			
	FROM CTE_INFORME_FLOTA A
) SELECT *
  FROM CTE_TDE TB1
  WHERE TB1.MATRICULA = ?
  AND TB1.ID_CENTRO = ?
  AND TB1.TEMPORADA = ?
  ORDER BY TB1.FECHA DESC
`;
exports.queryHANAReporteDescarga2 = queryHANAReporteDescarga2;