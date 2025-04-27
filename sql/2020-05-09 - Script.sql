CREATE TABLE [dbo].despacho_combustible_video(
	id UNIQUEIDENTIFIER PRIMARY KEY default NEWID(),
	despachoCombustibleId UNIQUEIDENTIFIER,
	azureContainerName [nvarchar](255) NOT NULL,
	azureDirectoryPath [nvarchar](128) NOT NULL,
	azureBlobName [nvarchar](255) NOT NULL,
	etiqueta [nvarchar](255) NOT NULL,
	thumbnail [nvarchar](255) NULL,
	thumbnailPath [nvarchar](255) NULL,
	thumbnailFullPath [nvarchar](256) NULL,
	base64header [nvarchar](255) NULL,
	estadoProceso [char](3) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].despacho_combustible_video  WITH CHECK ADD FOREIGN KEY(despachoCombustibleId)
REFERENCES [dbo].despacho_combustible ([id])
ON DELETE CASCADE
GO

CREATE TABLE [dbo].descarga_mp_video(
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
	estadoProceso [char](3) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].descarga_mp_video  WITH CHECK ADD FOREIGN KEY(descargaMpId)
REFERENCES [dbo].descarga_mp ([id])
ON DELETE CASCADE
GO