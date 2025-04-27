ALTER TABLE descarga_mp
ADD streamUrlPush nvarchar(255) NULL,
streamUrlView nvarchar(255) NULL,
streamMaxDate datetime NULL,
streamActive bit default 0
GO


CREATE TABLE [dbo].descarga_mp_stream(
	id UNIQUEIDENTIFIER PRIMARY KEY default NEWID(),
	descargaMpId UNIQUEIDENTIFIER,
	azureContainerName [nvarchar](255) NOT NULL,
	azureDirectoryPath [nvarchar](128) NOT NULL,
	azureBlobName [nvarchar](255) NOT NULL,
	etiqueta [nvarchar](255) NOT NULL,
	thumbnail [nvarchar](255) NULL,
	thumbnailPath [nvarchar](255) NULL,
	thumbnailFullPath [nvarchar](256) NULL,
	base64header [nvarchar](255) NULL,
	archivoHDD [nvarchar] (255) NULL,
	pathArchivoHDD [nvarchar] (255) NULL,
	fullPathArchivoHDD [nvarchar] (255) NULL,
	archivoUploadToAzure bit DEFAULT 0,
	estadoProceso [char](3) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].descarga_mp_stream  WITH CHECK ADD FOREIGN KEY(descargaMpId)
REFERENCES [dbo].descarga_mp ([id])
ON DELETE CASCADE
GO


ALTER TABLE descarga_mp_imagen ADD
archivoHDD [nvarchar] (255) NULL,
pathArchivoHDD [nvarchar] (255) NULL,
fullPathArchivoHDD [nvarchar] (255) NULL,
archivoUploadToAzure bit DEFAULT 0

GO

ALTER TABLE descarga_mp_video ADD
archivoHDD [nvarchar] (255) NULL,
pathArchivoHDD [nvarchar] (255) NULL,
fullPathArchivoHDD [nvarchar] (255) NULL,
archivoUploadToAzure bit DEFAULT 0

GO


ALTER TABLE despacho_combustible_imagen ADD
archivoHDD [nvarchar] (255) NULL,
pathArchivoHDD [nvarchar] (255) NULL,
fullPathArchivoHDD [nvarchar] (255) NULL,
archivoUploadToAzure bit DEFAULT 0

GO

ALTER TABLE despacho_combustible_video ADD
archivoHDD [nvarchar] (255) NULL,
pathArchivoHDD [nvarchar] (255) NULL,
fullPathArchivoHDD [nvarchar] (255) NULL,
archivoUploadToAzure bit DEFAULT 0

GO

ALTER TABLE residuos_solidos_imagen ADD
archivoHDD [nvarchar] (255) NULL,
pathArchivoHDD [nvarchar] (255) NULL,
fullPathArchivoHDD [nvarchar] (255) NULL,
archivoUploadToAzure bit DEFAULT 0

GO

/*

delete from descarga_mp_imagen
delete from descarga_mp_video
delete from descarga_mp_stream
delete from descarga_mp

delete from despacho_combustible_imagen
delete from despacho_combustible_video
delete from despacho_combustible

delete from residuos_solidos_imagen
delete from residuos_solidos
*/