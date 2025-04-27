CREATE TABLE [dbo].descarga_mp(
	id UNIQUEIDENTIFIER PRIMARY KEY default NEWID(),
	informeFlota [nvarchar](255) NOT NULL,
	armadorId [nvarchar](255) NOT NULL,
	armadorRuc [nvarchar](255) NOT NULL,
	armadorNombre [nvarchar](255) NOT NULL,
	embarcacionId [nvarchar](255) NOT NULL,
	embarcacionMatricula [nvarchar](255) NOT NULL,
	embarcacionNombre [nvarchar](255) NOT NULL,
	plantaId [nvarchar](255) NOT NULL,
	plantaNombre [nvarchar](255) NOT NULL,
	chataId [nvarchar](11) NOT NULL,
	chataNombre [nvarchar](255) NOT NULL,
	fechaDescarga [datetime] NOT NULL,
	armadorTelefono [nvarchar](255) NULL,
	armadorEmail  [nvarchar](255) NULL,
	estadoProceso [char](3) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

CREATE TABLE [dbo].descarga_mp_imagen(
	id UNIQUEIDENTIFIER PRIMARY KEY default NEWID(),
	descargaMpId UNIQUEIDENTIFIER,
	azureContainerName [nvarchar](255) NOT NULL,
	azureDirectoryPath [nvarchar](128) NOT NULL,
	azureBlobName [nvarchar](255) NOT NULL,
	etiqueta [nvarchar](255) NOT NULL,
	thumbnail [nvarchar](255) NULL,
	thumbnailPath [nvarchar](255) NULL,
	estadoProceso [char](3) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].descarga_mp_imagen  WITH CHECK ADD FOREIGN KEY(descargaMpId)
REFERENCES [dbo].descarga_mp ([id])
ON DELETE CASCADE
GO



CREATE TABLE [dbo].despacho_combustible(
	id UNIQUEIDENTIFIER PRIMARY KEY default NEWID(),
	armadorId [nvarchar](255) NOT NULL,
	armadorRuc [nvarchar](255) NOT NULL,
	armadorNombre [nvarchar](255) NOT NULL,
	embarcacionId [nvarchar](255) NOT NULL,
	embarcacionMatricula [nvarchar](255) NOT NULL,
	embarcacionNombre [nvarchar](255) NOT NULL,
	plantaId [nvarchar](255) NOT NULL,
	plantaNombre [nvarchar](255) NOT NULL,
	fechaDespacho [datetime] NOT NULL,
	armadorTelefono [nvarchar](255) NULL,
	armadorEmail  [nvarchar](255) NULL,
	estadoProceso [char](3) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

CREATE TABLE [dbo].despacho_combustible_imagen(
	id UNIQUEIDENTIFIER PRIMARY KEY default NEWID(),
	despachoCombustibleId UNIQUEIDENTIFIER,
	azureContainerName [nvarchar](255) NOT NULL,
	azureDirectoryPath [nvarchar](128) NOT NULL,
	azureBlobName [nvarchar](255) NOT NULL,
	etiqueta [nvarchar](255) NOT NULL,
	thumbnail [nvarchar](255) NULL,
	thumbnailPath [nvarchar](255) NULL,
	estadoProceso [char](3) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].despacho_combustible_imagen  WITH CHECK ADD FOREIGN KEY(despachoCombustibleId)
REFERENCES [dbo].despacho_combustible ([id])
ON DELETE CASCADE
GO


CREATE TABLE [dbo].residuos_solidos(
	id UNIQUEIDENTIFIER PRIMARY KEY default NEWID(),
	armadorId [nvarchar](255) NOT NULL,
	armadorRuc [nvarchar](255) NOT NULL,
	armadorNombre [nvarchar](255) NOT NULL,
	embarcacionId [nvarchar](255) NOT NULL,
	embarcacionMatricula [nvarchar](255) NOT NULL,
	embarcacionNombre [nvarchar](255) NOT NULL,
	plantaId [nvarchar](255) NOT NULL,
	plantaNombre [nvarchar](255) NOT NULL,
	chataId [nvarchar](11) NOT NULL,
	chataNombre [nvarchar](255) NOT NULL,
	fecha [datetime] NOT NULL,
	estadoProceso [char](3) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

CREATE TABLE [dbo].residuos_solidos_imagen(
	id UNIQUEIDENTIFIER PRIMARY KEY default NEWID(),
	residuosSolidosId UNIQUEIDENTIFIER,
	azureContainerName [nvarchar](255) NOT NULL,
	azureDirectoryPath [nvarchar](128) NOT NULL,
	azureBlobName [nvarchar](255) NOT NULL,
	etiqueta [nvarchar](255) NOT NULL,
	thumbnail [nvarchar](255) NULL,
	thumbnailPath [nvarchar](255) NULL,
	estadoProceso [char](3) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].residuos_solidos_imagen  WITH CHECK ADD FOREIGN KEY(residuosSolidosId)
REFERENCES [dbo].residuos_solidos ([id])
ON DELETE CASCADE
GO


CREATE TABLE [dbo].planta(
	id [nvarchar](4) PRIMARY KEY NOT NULL,
	nombre [nvarchar](128) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

INSERT INTO planta(id,nombre,createdAt,updatedAt) VALUES('H101','Planta COISHCO',GETDATE(),GETDATE())
INSERT INTO planta(id,nombre,createdAt,updatedAt) VALUES('H102','Planta MALABRIGO',GETDATE(),GETDATE())
INSERT INTO planta(id,nombre,createdAt,updatedAt) VALUES('H103','Planta PAITA',GETDATE(),GETDATE())
INSERT INTO planta(id,nombre,createdAt,updatedAt) VALUES('H104','Planta Ilo',GETDATE(),GETDATE())
INSERT INTO planta(id,nombre,createdAt,updatedAt) VALUES('H105','Planta VEGUETA',GETDATE(),GETDATE())
INSERT INTO planta(id,nombre,createdAt,updatedAt) VALUES('H106','Planta Tambo de Mora',GETDATE(),GETDATE())
GO

CREATE TABLE [dbo].chata(
	id [nvarchar](4) PRIMARY KEY NOT NULL,
	plantaId [nvarchar](4) NOT NULL,
	nombre [nvarchar](128) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].chata  WITH CHECK ADD FOREIGN KEY(plantaId)
REFERENCES [dbo].planta ([id])
ON DELETE CASCADE
GO

INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('CH01','H101','Chata COISHCO 1',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('CH02','H101','Chata COISHCO 2',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('CH03','H101','Chata COISHCO 2',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('CH04','H102','Chata MALABRIGO 1',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('CH05','H102','Chata MALABRIGO 2',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('CH06','H105','Chata VEGETA 1',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('CH07','H105','Chata VEGETA 2',GETDATE(),GETDATE())
GO