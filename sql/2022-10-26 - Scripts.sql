CREATE TABLE [dbo].[turno_solicitud](
	[id] [uniqueidentifier] NOT NULL,
	[ambito] [nvarchar](32) NOT NULL,
	[embarcacionId] [nvarchar](255) NULL,
	[embarcacionMatricula] [nvarchar](255) NOT NULL,
	[fechaSolicitud] [datetime] NOT NULL,
	[lat] [float] NOT NULL,
	[lng] [float] NOT NULL,
	[plantaId] [nvarchar](255) NULL,
	[estado][int] NOT NULL DEFAULT 0, 
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[turno_solicitud] ADD  DEFAULT (newid()) FOR [id]
GO

ALTER TABLE [dbo].[turno_solicitud] ADD intento INT NOT NULL DEFAULT 0
GO

CREATE TABLE [dbo].[turno_planta_geocerca](
	[id] [uniqueidentifier] NOT NULL,
	[plantaId] [nvarchar](4) NOT NULL,
	[nombre] [nvarchar](255) NOT NULL,
	[geom] [geometry] NOT NULL,
	[estado] [bit] NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[turno_planta_geocerca] ADD  DEFAULT (newid()) FOR [id]
GO

ALTER TABLE [dbo].[turno_planta_geocerca] ADD  DEFAULT ((1)) FOR [estado]
GO


/****** Object:  UserDefinedFunction [dbo].[geometry2json]    Script Date: 27/10/2022 11:58:44 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

/***** Function: [dbo].[geometry2json] **/
IF OBJECT_ID('dbPescandoHayduk..[geometry2json]') IS NOT NULL DROP FUNCTION dbo.[geometry2json]
GO

CREATE FUNCTION [dbo].[geometry2json]( @geo geometry)
 RETURNS nvarchar(MAX) AS
 BEGIN
 RETURN (
 '{' +
 (CASE @geo.STGeometryType()
 WHEN 'POINT' THEN
 '"type": "Point","coordinates":' +
 REPLACE(REPLACE(REPLACE(REPLACE(@geo.ToString(),'POINT ',''),'(',
'['),')',']'),' ',',')
 WHEN 'POLYGON' THEN 
 '"type": "Polygon","coordinates":' +
 '[' + REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
REPLACE(@geo.ToString(),'POLYGON ',''),'(','['),')',']'),'], ',']],
['),', ','],['),' ',',') + ']'
 WHEN 'MULTIPOLYGON' THEN 
 '"type": "MultiPolygon","coordinates":' +
 '[' + REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
REPLACE(@geo.ToString(),'MULTIPOLYGON ',''),'(','['),')',']'),'],
 ',']],['),', ','],['),' ',',') + ']'
 WHEN 'MULTIPOINT' THEN
 '"type": "MultiPoint","coordinates":' +
 '[' + REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
REPLACE(@geo.ToString(),'MULTIPOINT ',''),'(','['),')',']'),'],
 ',']],['),', ','],['),' ',',') + ']'
 WHEN 'LINESTRING' THEN
 '"type": "LineString","coordinates":' +
 '[' + REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
REPLACE(@geo.ToString(),'LINESTRING ',''),'(','['),')',']'),'], 
',']],['),', ','],['),' ',',') + ']'
 ELSE NULL
 END)
 +'}')
 END
 
GO

IF OBJECT_ID('dbPescandoHayduk..SP_TURNO_EMBARCACION_VERFICAR_INTERSECTA_GEOM_AUTOMATICO') IS NOT NULL DROP PROCEDURE dbo.SP_TURNO_EMBARCACION_VERFICAR_INTERSECTA_GEOM_AUTOMATICO
GO
CREATE PROCEDURE [dbo].SP_TURNO_EMBARCACION_VERFICAR_INTERSECTA_GEOM_AUTOMATICO
AS
BEGIN
	SET NOCOUNT ON;

	--Obtenemos las solicitudes pendientes de procesar
	IF OBJECT_ID('tempdb..#TB_SOL_PEND') IS NOT NULL DROP TABLE #TB_SOL_PEND;
	SELECT id, lat, lng, embarcacionMatricula
	INTO #TB_SOL_PEND
	FROM [dbo].[turno_solicitud]
	WHERE estado = 0

	--Verificamos si las solicitudes que intersectan algun poligono
	IF OBJECT_ID('tempdb..#TB_SOL_INTERSEC') IS NOT NULL DROP TABLE #TB_SOL_INTERSEC;
	SELECT
		tb2.id,
		tb2.embarcacionMatricula,
		tb1.plantaId,
		tb1.geom.STIntersects(geometry::STGeomFromText(CONCAT('POINT(',tb2.lat,' ',tb2.lng,')'), 3857)) as intersecta
	INTO #TB_SOL_INTERSEC
	FROM [dbo].[turno_planta_geocerca] tb1, #TB_SOL_PEND tb2
	WHERE tb1.estado = 1

	--Actualizamos las solicitudes a estado 8 cuando no intersectan
	UPDATE [dbo].[turno_solicitud] SET 
		[dbo].[turno_solicitud].[estado] = 8
	FROM #TB_SOL_INTERSEC tb2
	WHERE [dbo].[turno_solicitud].id = tb2.id
	AND tb2.intersecta = 0

	--Actualizamos las solicitudes a estado 1 cuando intersectan y les asignamos la plantaId
	UPDATE [dbo].[turno_solicitud] SET 
		[dbo].[turno_solicitud].[estado] = 1,
		[dbo].[turno_solicitud].[plantaId] = tb2.plantaId
	FROM #TB_SOL_INTERSEC tb2
	WHERE [dbo].[turno_solicitud].id = tb2.id
	AND tb2.intersecta = 1

	SELECT id, embarcacionMatricula, plantaId, FORMAT (fechaSolicitud, 'yyyyMMdd') as fechaHanna, fechaSolicitud, intento
	FROM [dbo].[turno_solicitud]
	WHERE estado = 1
	AND plantaId IS NOT NULL

	RETURN;
END
GO


IF OBJECT_ID('dbPescandoHayduk..SP_TURNO_EMBARCACION_ELIMINAR_SOLICITUDES') IS NOT NULL DROP PROCEDURE dbo.SP_TURNO_EMBARCACION_ELIMINAR_SOLICITUDES
GO
CREATE PROCEDURE [dbo].SP_TURNO_EMBARCACION_ELIMINAR_SOLICITUDES
AS
BEGIN

	DELETE FROM [dbo].[turno_solicitud]
	WHERE fechaSolicitud <= DATEADD(day, -2, GETDATE())
	AND estado = 9

END
GO

CREATE TABLE [dbo].[zona_pesca_zonas](
	[id] [uniqueidentifier] NOT NULL,
	[fecha] [date] NOT NULL,
	[latGMS] [nvarchar](32) NOT NULL,
	[lngGMS] [nvarchar](32) NOT NULL,
	[lat] [float] NOT NULL,
	[lng] [float] NOT NULL,
	[nombre] [nvarchar](255) NOT NULL,
	[descripcion] [text] NOT NULL,
	[estado][bit] NOT NULL DEFAULT 0, 
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[zona_pesca_zonas] ADD  DEFAULT (newid()) FOR [id]
GO


/*************************
SEGURIDAD
**************************/
INSERT INTO [dbo].[tipo_cuenta] (id, nombre, createdAt, updatedAt, notificarRegistroA, estado)
VALUES ('BAH', 'Bahía',GETDATE(), GETDATE(), '',1)
GO

UPDATE [dbo].[usuario]
SET tipoCuentaId = 'BAH'
WHERE tipoCuentaId = 'ARM'
GO

UPDATE [dbo].[tipo_cuenta]
SET nombre = 'Armador'
WHERE id = 'ARM'
GO

UPDATE [dbo].[tipo_cuenta_modulo]
SET tipoCuentaId = 'BAH' 
WHERE tipoCuentaId = 'ARM'
GO

INSERT INTO [dbo].[tipo_cuenta_modulo] (tipoCuentaId, moduloId, createdAt, updatedAt)
SELECT 'ARM', moduloId, GETDATE(), GETDATE()
FROM [dbo].[tipo_cuenta_modulo]
WHERE tipoCuentaId = 'BAH' 
GO


INSERT INTO [dbo].[tipo_cuenta_modulo] (tipoCuentaId, moduloId, createdAt, updatedAt) VALUES ('ARM','covidapp-ordenesCompra',GETDATE(),GETDATE())
INSERT INTO [dbo].[tipo_cuenta_modulo] (tipoCuentaId, moduloId, createdAt, updatedAt) VALUES ('ARM','covidapp-liquidaciones',GETDATE(),GETDATE())
INSERT INTO [dbo].[tipo_cuenta_modulo] (tipoCuentaId, moduloId, createdAt, updatedAt) VALUES ('BAH','covidapp-mipesca-zonaPesca',GETDATE(),GETDATE())
INSERT INTO [dbo].[tipo_cuenta_modulo] (tipoCuentaId, moduloId, createdAt, updatedAt) VALUES ('ARM','covidapp-mipesca-zonaPesca',GETDATE(),GETDATE())
GO

DELETE FROM [dbo].[tipo_cuenta_modulo]
WHERE moduloId = 'covidapp-mipesca-activacionMapa'
GO

IF OBJECT_ID('dbPescandoHayduk..SP_TURNO_EMBARCACION_VERFICAR_INTERSECTA_GEOM_MANUAL') IS NOT NULL DROP PROCEDURE dbo.SP_TURNO_EMBARCACION_VERFICAR_INTERSECTA_GEOM_MANUAL
GO
CREATE PROCEDURE [dbo].SP_TURNO_EMBARCACION_VERFICAR_INTERSECTA_GEOM_MANUAL @lat float, @lng float
AS
BEGIN
	SET NOCOUNT ON;

	IF OBJECT_ID('tempdb..#TB_INTERSECTA') IS NOT NULL DROP TABLE #TB_INTERSECTA;
	SELECT tb1.geom.STIntersects(geometry::STGeomFromText(CONCAT('POINT(',@lat,' ',@lng,')'), 3857)) as intersecta,
		tb1.plantaId
	INTO #TB_INTERSECTA
	FROM [dbo].[turno_planta_geocerca] tb1
	WHERE tb1.estado = 1

	SELECT TOP 1 *
	FROM #TB_INTERSECTA
	WHERE intersecta = 1
	
	RETURN;
END
GO


ALTER TABLE [dbo].[zona_pesca_zonas] ADD
referencias bit NOT NULL DEFAULT 0
GO

CREATE TABLE [dbo].[zona_pesca_referencia](
	[id] [nvarchar](32) NOT NULL,
	[nombre] [nvarchar](255) NOT NULL,
	[lat] float NOT NULL,
	[latGMS] nvarchar(32) NOT NULL,
	[lng] float NOT NULL,
	[lngGMS] nvarchar(32) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[zona_pesca_referencia] (id, nombre, lat, latGMS, lng, lngGMS, createdAt, updatedAt)
VALUES('CHI', 'Chicama', -7.69583, '7° 41.75 '' 0'''' S', -79.44369, '-79° 26.622'' 0'''' W', GETDATE(), GETDATE())
INSERT INTO [dbo].[zona_pesca_referencia] (id, nombre, lat, latGMS, lng, lngGMS, createdAt, updatedAt)
VALUES('COI', 'Coishco', -9.01788, '9° 01.073'' 0'''' S', -78.63179, '-78° 37.907'' 0'''' W', GETDATE(), GETDATE())
INSERT INTO [dbo].[zona_pesca_referencia] (id, nombre, lat, latGMS, lng, lngGMS, createdAt, updatedAt)
VALUES('CHB', 'Chimbote', -9.12514, '9° 07.508'' 0'''' S', -78.57597, '-78° 34.558'' 0'''' W', GETDATE(), GETDATE())
INSERT INTO [dbo].[zona_pesca_referencia] (id, nombre, lat, latGMS, lng, lngGMS, createdAt, updatedAt)
VALUES('VEG', 'Vegeta', -11.00347, '11° 00.208'' 0'''' S', -77.65204, '-77° 39.122'' 0'''' W', GETDATE(), GETDATE())
GO

CREATE TABLE [dbo].[zona_pesca_zonas_referencia](
	[zonaPescaReferenciaId] [nvarchar](32) NOT NULL,
	[zonaPescaZonasId] [uniqueidentifier] NOT NULL,
	[distKM] float NOT NULL,
	[distNMI] float NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	[zonaPescaZonasId], [zonaPescaReferenciaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[zona_pesca_zonas_referencia]  WITH CHECK ADD FOREIGN KEY([zonaPescaZonasId])
REFERENCES [dbo].[zona_pesca_zonas] ([id])
GO

ALTER TABLE [dbo].[zona_pesca_zonas_referencia]  WITH CHECK ADD FOREIGN KEY([zonaPescaReferenciaId])
REFERENCES [dbo].[zona_pesca_referencia] ([id])
GO


IF OBJECT_ID('dbPescandoHayduk..SP_GENERAR_ZONA_PESCA_ZONAS_REFERENCIAS') IS NOT NULL DROP PROCEDURE dbo.SP_GENERAR_ZONA_PESCA_ZONAS_REFERENCIAS
GO
CREATE PROCEDURE [dbo].SP_GENERAR_ZONA_PESCA_ZONAS_REFERENCIAS
AS
BEGIN
	IF OBJECT_ID('tempdb..#TB_ZONA_PESCA_ZONAS_PROC_REF') IS NOT NULL DROP TABLE #TB_ZONA_PESCA_ZONAS_PROC_REF;
	
	--Obtenemos las referencias de las zonas de pesca que tienen referencias en estado 0
	SELECT tbZPR.id as 'zonaPescaReferenciaId', 
			tbZPZ.id as 'zonaPescaZonasId',
			(geography::Point(tbZPZ.lat, tbZPZ.lng, 4326)).STDistance(geography::Point(tbZPR.lat, tbZPR.lng, 4326)) / 1000 as 'distKM',
			(geography::Point(tbZPZ.lat, tbZPZ.lng, 4326)).STDistance(geography::Point(tbZPR.lat, tbZPR.lng, 4326)) / 1852 as 'distNMI'
	INTO #TB_ZONA_PESCA_ZONAS_PROC_REF
	FROM [dbo].[zona_pesca_zonas] tbZPZ, [dbo].[zona_pesca_referencia] tbZPR
	WHERE tbZPZ.referencias = 0
	AND tbZPZ.estado = 1

	--Eliminamos las referencias de la zona de pesca
	DELETE FROM [dbo].[zona_pesca_zonas_referencia]
	WHERE zonaPescaZonasId IN (SELECT DISTINCT tb2.zonaPescaZonasId FROM #TB_ZONA_PESCA_ZONAS_PROC_REF tb2)

	--Insertamos las refencias de la zona de pesca
	INSERT INTO [dbo].[zona_pesca_zonas_referencia] (zonaPescaReferenciaId, zonaPescaZonasId, distKM, distNMI, createdAt, updatedAt)
	SELECT tb1.zonaPescaReferenciaId, tb1.zonaPescaZonasId, tb1.distKM, tb1.distNMI, GETDATE(), GETDATE()
	FROM #TB_ZONA_PESCA_ZONAS_PROC_REF tb1
	
	--Actualizamos la referencia de las zonas de pesca procesadas
	UPDATE tbZPZ
	SET 
	tbZPZ.referencias = 1,
	tbZPZ.updatedAt = GETDATE()
	FROM [dbo].[zona_pesca_zonas] tbZPZ
	INNER JOIN #TB_ZONA_PESCA_ZONAS_PROC_REF tbZPZPR ON tbZPZ.id = tbZPZPR.zonaPescaZonasId
END
GO

ALTER TABLE [dbo].[usuario] ADD
compliance bit NOT NULL DEFAULT 0,
fechaAceptacionCompliance datetime NULL
GO


CREATE TABLE [dbo].[usuario_aceptacion_terminos](
	[id] [uniqueidentifier] NOT NULL,
	[username] [nvarchar](255) NOT NULL,
	[documento][nvarchar](255) NOT NULL,
	[fechaAceptacion] datetime NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO