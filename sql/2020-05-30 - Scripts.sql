ALTER TABLE descarga_mp_imagen ADD estado bit NOT NULL DEFAULT 1
ALTER TABLE descarga_mp_video ADD estado bit NOT NULL DEFAULT 1
ALTER TABLE descarga_mp ADD estado bit NOT NULL DEFAULT 1

ALTER TABLE despacho_combustible_imagen ADD estado bit NOT NULL DEFAULT 1
ALTER TABLE despacho_combustible_video ADD estado bit NOT NULL DEFAULT 1
ALTER TABLE despacho_combustible ADD estado bit NOT NULL DEFAULT 1

ALTER TABLE residuos_solidos_imagen ADD estado bit NOT NULL DEFAULT 1
ALTER TABLE residuos_solidos ADD estado bit NOT NULL DEFAULT 1
GO

INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-operaciones-descargamp-delete','Eliminar registros',GETDATE(),GETDATE(),'covidapp-operaciones-descargamp',4)
INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-operaciones-despachocombustible-delete','Eliminar registros',GETDATE(),GETDATE(),'covidapp-operaciones-despachocombustible',4)
INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-operaciones-residuossolidos-delete','Eliminar registros',GETDATE(),GETDATE(),'covidapp-operaciones-residuossolidos',4)
GO

