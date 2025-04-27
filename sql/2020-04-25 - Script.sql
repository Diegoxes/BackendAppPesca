USE dbCovidApp;
GO


CREATE TRIGGER [dbo].[trg_modulo_updateHierarchyLevel]
ON [dbo].[modulo]
AFTER INSERT, UPDATE AS
BEGIN

	declare @hierarchyLevel int

	SELECT @hierarchyLevel = ISNULL(tbm.hierarchyLevel,0) + 1
	FROM dbo.modulo tbm
	INNER JOIN inserted i ON tbm.id = i.padreId

	IF @hierarchyLevel IS NULL
		set @hierarchyLevel = 1
	
	UPDATE tbm
	SET hierarchyLevel = @hierarchyLevel
	FROM dbo.modulo tbm
	INNER JOIN inserted as i
	ON tbm.id = i.id

END
GO

ALTER TABLE [dbo].[modulo] ENABLE TRIGGER [trg_modulo_updateHierarchyLevel]
GO

CREATE TABLE [dbo].tipo_cuenta_modulo(
	tipoCuentaId [char](3) NOT NULL,
	moduloId [nvarchar](255) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	tipoCuentaId ASC, moduloId
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].tipo_cuenta_modulo  WITH CHECK ADD FOREIGN KEY([tipoCuentaId])
REFERENCES [dbo].tipo_cuenta ([id])
GO

ALTER TABLE [dbo].tipo_cuenta_modulo  WITH CHECK ADD FOREIGN KEY(moduloId)
REFERENCES [dbo].modulo ([id])
GO

INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp','INV',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp','CON',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate','INV',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate','CON',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate-directoriohayduk','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate-directoriohayduk','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate-numerosemergencia','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate-numerosemergencia','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate-numerosemergencia','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate-numerosemergencia','INV',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-comunicate-numerosemergencia','CON',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate','INV',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate','CON',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-infocovid','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-infocovid','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-infocovid','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-infocovid','INV',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-infocovid','CON',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-protocolosanitario','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-protocolosanitario','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-protocolosanitario','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-protocolosanitario','INV',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-protocolosanitario','CON',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-reportes','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-reportes','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-reportes','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-reportes','INV',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-informate-reportes','CON',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-mipesca','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-mipesca-descargamp','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-mipesca-despachocombustible','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-mipesca-residuossolidos','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud','INV',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud','CON',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud-declaracion','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud-declaracion','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud-declaracion','ARM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud-declaracion','INV',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud-declaracion','CON',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud-estado','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud-estado','FAM',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud-seguimiento','TRA',GETDATE(),GETDATE())
INSERT INTO tipo_cuenta_modulo (moduloId,tipoCuentaId, createdAt, updatedAt) VALUES ('covidapp-misalud-seguimiento','FAM',GETDATE(),GETDATE())
GO
