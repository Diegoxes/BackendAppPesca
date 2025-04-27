var queryHANAOrdenesCompraArmador = `SELECT NAME1 as "razonSocial",
            STCD1 as "ruc",
            LIFNR as "codigoEmbarcacion",
            FULL_NAME as "nombreEmbarcacion",
            EBELN as "ordenCompra",
            TO_VARCHAR (BEDAT, 'DD/MM/YYYY') as "fechaOrdenCompra",
            MENGE as "pesoIngresos",
            MEINS as "unidad"
        FROM "SAPABAP1"."ZCDSMM_303"
        WHERE STCD1 = '%RUC%'
        AND BEDAT BETWEEN '%FEC_INI%' AND '%FEC_FIN%'
        %EMBARCACION_FILTER%
        ORDER BY BEDAT DESC
        LIMIT %LIMIT% OFFSET %OFFSET%`;
exports.queryHANAOrdenesCompraArmador = queryHANAOrdenesCompraArmador;


var queryHANAOrdenesCompraArmadorCount = `SELECT COUNT(EBELN) as "cantidad"
        FROM "SAPABAP1"."ZCDSMM_303"
        WHERE STCD1 = '%RUC%'
        AND BEDAT BETWEEN '%FEC_INI%' AND '%FEC_FIN%'
        %EMBARCACION_FILTER%`;
exports.queryHANAOrdenesCompraArmadorCount = queryHANAOrdenesCompraArmadorCount;