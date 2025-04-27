ALTER TABLE descarga_mp
ADD streamUrlPush nvarchar(255) NULL,
streamUrlView nvarchar(255) NULL,
streamMaxDate datetime NULL,
streamActive bit default 0
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