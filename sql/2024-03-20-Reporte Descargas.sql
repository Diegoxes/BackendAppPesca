INSERT INTO [dbo].[modulo]([id],[nombre],[createdAt],[updatedAt],[padreId],[hierarchyLevel])
VALUES ( 'covidapp-reporte-reporteDescargas','Reporte de descargas',GETDATE(),GETDATE(),'covidapp-reporte',3)
GO

INSERT INTO [dbo].[usuario_modulo] ([username],[moduloId],[createdAt],[updatedAt])
SELECT username, 'covidapp-reporte',GETDATE(),GETDATE()
FROM [dbo].[usuario]
WHERE [tipoCuentaId] IN ('ARM')
GO

INSERT INTO [dbo].[usuario_modulo] ([username],[moduloId],[createdAt],[updatedAt])
SELECT username, 'covidapp-reporte-reporteDescargas',GETDATE(),GETDATE()
FROM [dbo].[usuario]
WHERE [tipoCuentaId] IN ('ARM')
GO

INSERT INTO [dbo].[tipo_cuenta_modulo] ([tipoCuentaId],[moduloId],[createdAt],[updatedAt])
VALUES ('ARM','covidapp-reporte',GETDATE(),GETDATE()),
	   ('ARM','covidapp-reporte-reporteDescargas',GETDATE(),GETDATE())
GO