var queryHANATemporadas = `select TOP 5 
        ctemporada as "codigoTemporada", 
        fec_inic as "fechaInicio", 
        fec_fin_reg as "fechaFin"
    from sapabap1.ztpp_temp_pesca
    where idregion = '01'
    order by ctemporada desc`;
exports.queryHANATemporadas = queryHANATemporadas;