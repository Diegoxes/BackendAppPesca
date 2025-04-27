ALTER TABLE tipo_cuenta
ADD notificarRegistroA [nvarchar](255) NULL
GO

INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-operaciones-descargamp-renewStream','Renovar URL Stream',GETDATE(),GETDATE(),'covidapp-operaciones-descargamp',4)
INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-operaciones-descargamp-acceder','Acceder módulo',GETDATE(),GETDATE(),'covidapp-operaciones-descargamp',4)
INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-operaciones-despachocombustible-acceder','Acceder módulo',GETDATE(),GETDATE(),'covidapp-operaciones-despachocombustible',4)
INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-operaciones-residuossolidos-acceder','Acceder módulo',GETDATE(),GETDATE(),'covidapp-operaciones-residuossolidos',4)
GO


UPDATE tipo_cuenta 
SET notificarRegistroA = 'ggonzales@hayduk.com.pe'
WHERE id = 'ARM';
GO
