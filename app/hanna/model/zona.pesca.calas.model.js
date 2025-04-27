var queryGetCalas = `SELECT A.EMBARC as "nombreEmbarcacion",
                        B.NUMCALA as "nroCala", 
                        TO_VARCHAR (B.FECCAL1, 'DD/MM/YYYY') as "fechaCala", 
                        B.HORCAL1 as "horaCala",
                        B.LATGRA as "latG", 
                        B.LATMIN as "latM", 
                        B.LONGRA as "lonG", 
                        B.LONMIN as "lonM", 
                        B.TBODE as "tnBodega",
                        C.CASCO as "tipoCasco"
                    FROM SAPABAP1.ZTPP_INFOR_FLOTA A
                    JOIN SAPABAP1.ZTPP_CALAS B ON A.NUMINF = B.NUMINF
                    JOIN SAPABAP1.ZTPP_EMBARC_OFIC C ON A.MATRICULA = C.MATRICULA
                    WHERE FECCAL1 = ?`;
exports.queryGetCalas = queryGetCalas;