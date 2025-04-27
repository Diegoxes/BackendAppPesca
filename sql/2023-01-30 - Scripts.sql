CREATE TABLE [dbo].[device_armador](
	[id] [nvarchar](32) NOT NULL,
	[matricula] [nvarchar](32) NOT NULL,
	[nombre] [nvarchar](255) NOT NULL,
	[deviceName] [nvarchar](255) NOT NULL,
	[estado] [int] NOT NULL DEFAULT 0, 
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[device_armador]([id] ,[matricula] ,[nombre], [deviceName],[estado] ,[createdAt] ,[updatedAt])
VALUES ('ac1f09fffe06d19e', 'PT-3888-CM', 'CINTHIA','DEVICE-3', 1, GETDATE(), GETDATE())

INSERT INTO [dbo].[device_armador]([id] ,[matricula] ,[nombre] ,[deviceName], [estado] ,[createdAt] ,[updatedAt])
VALUES ('ac1f09fffe06d19f', 'CO-20239-CM', 'JUAN','DEVICE-4', 1, GETDATE(), GETDATE())

INSERT INTO [dbo].[device_armador]([id] ,[matricula] ,[nombre] ,[deviceName], [estado] ,[createdAt] ,[updatedAt])
VALUES ('', 'CE-16661-PM', 'BAMAR II','DEVICE-5', 1, GETDATE(), GETDATE())

INSERT INTO [dbo].[device_armador]([id] ,[matricula] ,[nombre] ,[deviceName], [estado] ,[createdAt] ,[updatedAt])
VALUES ('', 'CE-21455-PM', 'KIARA B','DEVICE-6', 1, GETDATE(), GETDATE())


CREATE TABLE [dbo].[device_armador_gps] (
	[id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[planta] [nvarchar](255) NOT NULL,
	[deviceArmadorId] [nvarchar](32) NOT NULL,
	[fecha] [datetimeoffset](7) NOT NULL DEFAULT GETDATE(),
	[gateway] [nvarchar](255) NULL,
	[name] [nvarchar](255) NULL,
	[lat] [float] NULL,
	[lon] [float] NULL,
	[rssi] [float] NULL,
	[bat] [float] NULL
)
GO

ALTER TABLE [dbo].[device_armador_gps] ADD estado int NOT NULL DEFAULT 0
GO

ALTER VIEW dbo.V_DEVICE_GPS_ULTIMA_POSICION_1H
AS
	WITH DEVICE_GPS_ULTIMA_POSICION_1H AS (
		SELECT MAX(tb1.[ID]) as ID_SED
			  ,tb1.[deviceArmadorId]
		FROM [dbo].[device_armador_gps] tb1
		WHERE CAST(tb1.[fecha] AT TIME ZONE 'SA Pacific Standard Time' AS datetime) BETWEEN DATEADD(HOUR,-1,CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'SA Pacific Standard Time' AS datetime)) AND CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'SA Pacific Standard Time' AS datetime)
		AND tb1.estado = 0
		GROUP BY tb1.[deviceArmadorId]
	)

	SELECT tb1.id,
		tb1.planta,
		tb1.deviceArmadorId,
		tb1.fecha,
		tb1.lat,
		tb1.lon,
		tb1.rssi,
		tb1.bat,
		tb3.matricula,
		tb3.nombre,
		tb1.estado
	FROM [dbo].[device_armador_gps] AS tb1
	INNER JOIN DEVICE_GPS_ULTIMA_POSICION_1H AS tb2 ON tb1.id = tb2.ID_SED
	LEFT JOIN [dbo].[device_armador] AS tb3 ON tb1.deviceArmadorId = tb3.[id]
GO

ALTER PROCEDURE [dbo].[SP_TURNO_EMBARCACION_VERFICAR_INTERSECTA_GEOM_AUTOMATICO]
AS
BEGIN
	SET NOCOUNT ON;

	-- CAMBIAMOS EL ESTADO LAS POSICIONES DE GPS QUE TIENEN MAS DE 5 MINUTOS DE ANTIGUEDAD
	UPDATE [dbo].[device_armador_gps]
	SET estado = 1
	WHERE CAST([fecha] AT TIME ZONE 'SA Pacific Standard Time' AS datetime) < DATEADD(MINUTE,-10,CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'SA Pacific Standard Time' AS datetime))
	AND estado = 0
		
	-- VALIDACION 1: OBTENEMOS LAS POSICIONES GPS QUE SE ENCUENTRA DENTRO DE LA TEMPORADA DE PESCA
	-- VALIDACION 2: VALIDAMOS QUE LAS POSICIONES NO HAYAN TENIDO TURNO GENERADO EN LAS ULTIMAS 12 HORAS (VALIDAR LAS HORAS)
	DECLARE @temporada nvarchar(32)
	DECLARE @fechaInicioTemp date
	DECLARE @fechaFinTemp date

	SELECT TOP 1 @temporada=[temporada], @fechaInicioTemp=[fechaInicio], @fechaFinTemp=[fechaFin]
	FROM [dbo].[temporada]
	ORDER BY temporada DESC

	IF OBJECT_ID('tempdb..#TB_POSICION_GPS_ARMADOR') IS NOT NULL DROP TABLE #TB_POSICION_GPS_ARMADOR;
	SELECT *
	INTO #TB_POSICION_GPS_ARMADOR
	FROM V_DEVICE_GPS_ULTIMA_POSICION_1H
	WHERE estado = 0
	AND CAST([fecha] AT TIME ZONE 'SA Pacific Standard Time' AS datetime) BETWEEN @fechaInicioTemp AND @fechaFinTemp --VALDICACION 1
	AND matricula NOT IN (
		SELECT DISTINCT embarcacionMatricula
		FROM turno_solicitud
		WHERE fechaSolicitud > DATEADD(HOUR, -12, GETDATE())
		AND estado IN (0,1,2,9) -- Estados que no se consideran para una nueva solicitud de turno (0=Pendiente, 1=Proceso, 2=Turno Activo, 9=Turno ya existe)
	) -- VALIDACION 2

	--Actualizamos el estado de las tramas gps del armador a 1 indicando que ya fueron procesadas
	UPDATE [dbo].[device_armador_gps]
	SET [dbo].[device_armador_gps].estado = 1
	FROM #TB_POSICION_GPS_ARMADOR tb1
	WHERE [dbo].[device_armador_gps].id = tb1.id
	
	--VALIDACION 3: Verificamos que la posición de GPS intersecte una de las zonas de descarga para generar el turno
	IF OBJECT_ID('tempdb..#TB_INTERSECTA_AUTO') IS NOT NULL DROP TABLE #TB_INTERSECTA_AUTO;
	SELECT
		tb2.id as 'deviceArmadorGpsId',
		tb2.matricula,
		CAST(tb2.[fecha] AT TIME ZONE 'SA Pacific Standard Time' AS datetime) as fecha,
		tb2.lat,
		tb2.lon,
		tb1.plantaId,
		tb1.geom.STIntersects(geometry::STGeomFromText(CONCAT('POINT(',tb2.lat,' ',tb2.lon,')'), 3857)) as intersecta
	INTO #TB_INTERSECTA_AUTO
	FROM [dbo].[turno_planta_geocerca] tb1, #TB_POSICION_GPS_ARMADOR tb2
	WHERE tb1.estado = 1
		
	INSERT INTO [dbo].[turno_solicitud] ([ambito], [embarcacionId], [embarcacionMatricula], [fechaSolicitud], [lat], [lng], [plantaId], [estado], [createdAt], [updatedAt], [intento], [username])
    SELECT 'gps','',tb1.matricula, tb1.fecha, tb1.lat, tb1.lon, tb1.plantaId, 1, GETDATE(), GETDATE(),0, ''
	FROM #TB_INTERSECTA_AUTO tb1
	WHERE tb1.intersecta = 1
	AND tb1.matricula IS NOT NULL

	SELECT id, embarcacionMatricula, plantaId, FORMAT (fechaSolicitud, 'yyyyMMdd') as fechaHanna, fechaSolicitud, intento, estado
	FROM [dbo].[turno_solicitud]
	WHERE estado = 1
	AND ambito = 'gps'
	AND plantaId IS NOT NULL

	RETURN;
END
GO

CREATE PROCEDURE [dbo].[SP_TURNO_EMBARCACION_CANCELAR_SOLICITUDES_TURNO]
AS
BEGIN
	UPDATE [dbo].[turno_solicitud]
	SET estado = 10
	WHERE fechaSolicitud < DATEADD(HOUR, -1, GETDATE())
	AND estado = 0
	
END
GO

CREATE PROCEDURE [dbo].[SP_ELIMINAR_DEVICE_ARMADOR_GPS]
AS
BEGIN
	DELETE FROM [dbo].[device_armador_gps]
	WHERE CAST([fecha] AT TIME ZONE 'SA Pacific Standard Time' AS date) < CAST(DATEADD(HOUR,-24,GETDATE()) as date)
END
GO
