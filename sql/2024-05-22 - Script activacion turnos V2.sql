/****** Object:  Table [dbo].[turnos_automaticos_V2_devices]   Script Date: 22/05/2024 14:02:53 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[turnos_automaticos_V2_devices](
	[deviceId] [nvarchar](32) NOT NULL,
	[temporada] [nvarchar](16) NOT NULL,
	[matricula] [nvarchar](32) NOT NULL,
	[nombre] [nvarchar](255) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	[deviceId], [temporada]
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[turnos_automaticos_V2_tramas_gps]    Script Date: 22/05/2024 14:18:26 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[turnos_automaticos_V2_tramas_gps](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[planta] [nvarchar](255) NOT NULL,
	[deviceId] [nvarchar](32) NOT NULL,
	[fecha] [datetimeoffset](7) NOT NULL,
	[gateway] [nvarchar](255) NULL,
	[name] [nvarchar](255) NULL,
	[lat] [float] NULL,
	[lon] [float] NULL,
	[rssi] [float] NULL,
	[bat] [float] NULL,
	[estado] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[turnos_automaticos_V2_tramas_gps] ADD  DEFAULT (getdate()) FOR [fecha]
GO

ALTER TABLE [dbo].[turnos_automaticos_V2_tramas_gps] ADD  DEFAULT ((0)) FOR [estado]
GO

/****** Object:  Table [dbo].[turnos_automaticos_V2_tramas_gps_historico]    Script Date: 22/05/2024 14:18:26 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[turnos_automaticos_V2_tramas_gps_historico](
	[id] [int] NOT NULL,
	[planta] [nvarchar](255) NOT NULL,
	[deviceId] [nvarchar](32) NOT NULL,
	[fecha] [datetimeoffset](7) NOT NULL,
	[gateway] [nvarchar](255) NULL,
	[name] [nvarchar](255) NULL,
	[lat] [float] NULL,
	[lon] [float] NULL,
	[rssi] [float] NULL,
	[bat] [float] NULL,
	[estado] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


/****** Object:  Table [dbo].[turnos_automaticos_V2_planta_ubicacion]  Script Date: 22/05/2024 14:18:26 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[turnos_automaticos_V2_planta_ubicacion](
	planta [nvarchar](255) NOT NULL,
	lat float NULL,
	lon float NULL,
	distanciaActivarTurnoMt float --Distancia minima para activar el turno en metros
PRIMARY KEY CLUSTERED 
(
	planta ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO [dbo].[turnos_automaticos_V2_planta_ubicacion] ([planta], [lat], [lon], [distanciaActivarTurnoMt])
VALUES 
('Coishco',-9.01953333,-78.6282139,700),
('Malabrigo',-7.68418889,-79.4427806,700)
GO

ALTER TABLE [dbo].[turnos_automaticos_V2_planta_ubicacion]
ADD sapId nvarchar(16)
GO

UPDATE [dbo].[turnos_automaticos_V2_planta_ubicacion]
set sapId = 'H101'
where planta = 'Coishco'
GO

UPDATE [dbo].[turnos_automaticos_V2_planta_ubicacion]
set sapId = 'H102'
where planta = 'Malabrigo'
GO

--Añadir la columna por el editor de tabla...
ALTER TABLE dbo.temporada
ADD activa INT NULL DEFAULT 0
GO
UPDATE dbo.temporada
SET activa = 1
WHERE temporada = '2024-1'
GO

INSERT INTO [dbo].[turnos_automaticos_V2_devices]([deviceId],[temporada],[matricula],[nombre],[createdAt],[updatedAt])
VALUES 
('ac1f09fffe0900fb','2024-1', 'PL-18087-CM', 'CHOLO FERMIN',GETDATE(),GETDATE()),
('ac1f09fffe06d19e','2024-1', 'PT-3888-CM',	'CINTHIA',GETDATE(),GETDATE()),
('ac1f09fffe090133','2024-1', 'PL-2270-CM',	'DELFIN 2',GETDATE(),GETDATE()),
('ac1f09fffe0900e9','2024-1', 'PL-2264-CM',	'EL NAYLAMP',GETDATE(),GETDATE()),
('ac1f09fffe090107','2024-1', 'CO-42361-PM', 'MALVI MARIA',GETDATE(),GETDATE()),
('ac1f09fffe0900ce','2024-1', 'PL-4334-CM',	'MI ALBERTO II',GETDATE(),GETDATE()),
('ac1f09fffe0900c7','2024-1', 'PL-2256-CM',	'NIÑO DEL MILAGRO',GETDATE(),GETDATE()),
('ac1f09fffe0900ef','2024-1', 'PT-6093-CM',	'VIRGENCITA DE LA PUERTA',GETDATE(),GETDATE()),
('ac1f09fffe0900f2','2024-1', 'PT-58953-PM', 'DON JUAN II',GETDATE(),GETDATE()),
('ac1f09fffe090109','2024-1', 'PL-61753-PM', 'JOSE OTILIO V',GETDATE(),GETDATE()),
('ac1f09fffe0900e7','2024-1', 'PT-11749-CM', 'LEYLITA 3',GETDATE(),GETDATE()),
('ac1f09fffe0900d8','2024-1', 'PT-20762-CM', 'SEÑOR DE LA ASENCION II',GETDATE(),GETDATE()),
('ac1f09fffe0900d3','2024-1', 'TA-21062-PM', 'SIEMPRE LEONOR',GETDATE(),GETDATE())

CREATE VIEW dbo.v_turnos_automaticos_V2_ultima_posicion
AS
	WITH DEVICE_GPS_ULTIMA_POSICION_1H_V2 AS (
		SELECT MAX(tb1.[ID]) as ID_SED
				,tb1.[deviceId]
		FROM [dbo].[turnos_automaticos_V2_tramas_gps] tb1
		WHERE tb1.estado = 1
		--AND CAST(tb1.[fecha] AT TIME ZONE 'SA Pacific Standard Time' AS datetime) BETWEEN DATEADD(HOUR,-6,CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'SA Pacific Standard Time' AS datetime)) AND CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'SA Pacific Standard Time' AS datetime)
		GROUP BY tb1.[deviceId]
	)

	SELECT tb1.id,
			tb1.planta,
			tb1.[deviceId],
			tb1.fecha,
			tb1.lat,
			tb1.lon,
			tb1.rssi,
			tb1.bat,
			tb3.matricula,
			tb3.nombre,
			tb3.temporada,
			tb1.estado
	FROM [dbo].[turnos_automaticos_V2_tramas_gps] AS tb1
	INNER JOIN DEVICE_GPS_ULTIMA_POSICION_1H_V2 AS tb2 ON tb1.id = tb2.ID_SED
	LEFT JOIN [dbo].[turnos_automaticos_V2_devices] AS tb3 ON tb1.[deviceId] = tb3.[deviceId] AND tb3.temporada = (SELECT temporada FROM [dbo].[temporada] WHERE activa = 1)
GO

CREATE TABLE [dbo].[turnos_automaticos_V2_turnos] (
	[deviceId] [nvarchar](32) NOT NULL,
	[planta] [nvarchar](255) NOT NULL,
	[turnoFecha] [date] NOT NULL,
	[temporada] [nvarchar](16) NOT NULL,
	[matricula] [nvarchar](32) NOT NULL,
	[embarcacion] [nvarchar](255) NOT NULL,
	[tramasGPSIds] NVARCHAR(MAX) NOT NULL,
	[point1TramaGpsId] [int] NOT NULL, -- Point1 -> Es la primera o ultima trama recibida
	[point1Fecha] [datetime] NOT NULL, -- Fecha de la trama
	[point1Lat] [float] NULL,
	[point1Lon] [float] NULL,
	[point2TramaGpsId] [int] NULL, -- Point2 -> Es la trama recibida anterior a la ultima
	[point2Fecha] [datetime] NULL, -- Fecha de la trama
	[point2Lat] [float] NULL,
	[point2Lon] [float] NULL,
	[nroPointHaciaChata] [int] NOT NULL, --nro de puntos que la distancia a la chata se va disminuyendo... si llegamos a 3 se cambia a estado 'Rumbo a descargar'
	[distanciaMt_p1_p2] [float] NULL, -- Distancia en metros
	[velocidadMt_p1_p2] [float] NULL,
	[distanciaAChataMt] [float] NULL,
	[distanciaAChataMtHist] NVARCHAR(MAX),
	[distanciaEstXVelAChataMt] [float] NULL,
	[distanciaEstXVelAChataMtHist] NVARCHAR(MAX),
	[prioridadTurnoEjecucion] [nvarchar](32) NULL,
	[estadoViaje] [nvarchar](32) NOT NULL, -- 'Detectado' (1trama), 'Rumbo a descargar' (La distancia se reduce 3 veces consecutivas), 'Esperando Descargar' => Tiene turno generado en SAP
	[estadoTurnoSAP] [nvarchar](32) NOT NULL,
	[intentoCreacionSAP] [int] NULL,
	[usernameCreacionSAP] [nvarchar](32) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[deviceId], [planta], [turnoFecha], [temporada]  ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[turnos_automaticos_V2_turnos]
ADD motivoNoCreacionSAP NVARCHAR(256)
GO
ALTER TABLE [dbo].[turnos_automaticos_V2_turnos]
ADD respuestaSAP NVARCHAR(256)
GO

CREATE OR ALTER PROCEDURE dbo.sp_turnos_automaticos_V2_validar_posiciones_embarcaciones
AS
BEGIN
	-- PROCESAMOS LAS EMBARCACIONES QUE SE PUEDE ACTIVAR EL TURNO
	DECLARE @fechaActual DATETIME = GETDATE();
	
	DECLARE cursor_posicion_actual_v2 CURSOR FOR
	SELECT id, planta, fecha, deviceId, lat, lon, matricula, nombre, temporada 
	FROM dbo.v_turnos_automaticos_V2_ultima_posicion
	WHERE estado = 1

	--Variables para la trama GPS
	DECLARE @id INT,
	@planta NVARCHAR(255),
	@fecha DATETIME,
	@deviceId NVARCHAR(32),
	@lat FLOAT,
	@lon FLOAT,
	@matricula NVARCHAR(32),
	@nombre NVARCHAR(255),
	@temporada NVARCHAR(16);

	--Variables para el turno
	DECLARE
	@fechaTurno DATE,
	@existeTurno INT,
	@estadoViaje NVARCHAR(32),
	@tramasGPSIds NVARCHAR(MAX),
	@point1TramaGPSId INT,
	@point1Fecha DATETIME,
	@point1Lat FLOAT,
	@point1Lon FLOAT,
	@point2TramaGPSId INT,
	@point2Fecha DATETIME,
	@point2Lat FLOAT,
	@point2Lon FLOAT,
	@nroPointHaciaChata INT;

	--Variables para el turno
	DECLARE 
	@distanciaMtP1P2 FLOAT,
	@diferenciaTiempoP1P2seg FLOAT,
	@velocidadP1P2MtXSeg FLOAT,
	@distanciaAChataP1Mt FLOAT,
	@distanciaAChataMtHist NVARCHAR(MAX),
	@distanciaEstXVelAChataMt FLOAT,
	@distanciaEstXVelAChataMtHist NVARCHAR(MAX),
	@distanciaAChataP2Mt FLOAT,
	@geoPoint1 GEOGRAPHY,
	@geoPoint2 GEOGRAPHY,
	@plantaPoint GEOGRAPHY,
	@plantaDistaciaActivarTurno FLOAT;
	
	OPEN cursor_posicion_actual_v2

	FETCH NEXT FROM cursor_posicion_actual_v2
	INTO @id, @planta, @fecha, @deviceId, @lat, @lon, @matricula, @nombre, @temporada

	WHILE @@FETCH_STATUS = 0
	BEGIN
		PRINT 'PROCESAMOS ' + CAST(@id AS NVARCHAR(MAX)) + ' - ' + 
							  @planta + ' - ' + 
							  FORMAT(CAST(@fecha AT TIME ZONE 'SA Pacific Standard Time' AS datetime),'yyyy-MM-dd HH:mm:ss') + ' - ' + 
							  @deviceId + ' - ' + 
							  CAST(@lat AS NVARCHAR(MAX)) + ' - ' + 
							  CAST(@lon AS NVARCHAR(MAX)) + ' - ' + 
							  @matricula + ' - ' +
							  @nombre + ' - ' + 
							  @temporada;

		--Procesamos la fecha de turno de descarga. Si esta entre las 00 y 07 horas corresponde al dia anterior
		SET @fechaTurno = CAST(@fecha AS DATE);
		IF DATEPART(hour ,@fecha) < 7
			SET @fechaTurno = DATEADD(day, -1, @fechaTurno)

		SELECT @existeTurno = 1, 
				@estadoViaje = estadoViaje,
				@tramasGPSIds = tramasGPSIds, 
				@point1TramaGPSId = point1TramaGpsId, 
				@point1Fecha = point1Fecha, 
				@point1Lat = point1Lat, 
				@point1Lon = point1Lon,
				@point2TramaGPSId = point1TramaGpsId, 
				@point2Fecha = point1Fecha, 
				@point2Lat = point1Lat, 
				@point2Lon = point1Lon,
				@nroPointHaciaChata = nroPointHaciaChata
		FROM [dbo].[turnos_automaticos_V2_turnos]
		WHERE deviceId = @deviceId
		AND planta = @planta
		AND turnoFecha = CAST(@fecha AS DATE)
		AND temporada = @temporada;

		PRINT 'TURNO = ' + CAST(@existeTurno as nvarchar(max))

		IF @existeTurno IS NULL -- SI EL TURNO NO EXISTE
		BEGIN
			PRINT 'EL TURNO NO EXISTE';
			IF @lat IS NOT NULL AND @lon IS NOT NULL 
			BEGIN
				--Calculamos la distancia del punto a la planta
				SET @geoPoint1 = geography::Point(@lat, @lon, 4326);

				-- Obtenemos la posicion del GPS referencia de la planta y la distancia en metros para activar el turno.
				SELECT @plantaPoint = geography::Point(lat, lon, 4326), 
					@plantaDistaciaActivarTurno = distanciaActivarTurnoMt
				FROM [dbo].[turnos_automaticos_V2_planta_ubicacion]
				WHERE planta = @planta;

				-- Calculamos la distancia del nuevo punto al punto de la planta
				SET @distanciaAChataP1Mt = @geoPoint1.STDistance(@plantaPoint); -- En metros
				
				--Insertamos el turno en la tabla con estado 'Detectado' 
				INSERT INTO [dbo].[turnos_automaticos_V2_turnos] 
				([deviceId], [planta], [turnoFecha], [temporada], [matricula], [embarcacion], [tramasGPSIds],
					[point1TramaGpsId], [point1Fecha], [point1Lat], [point1Lon], 
					[point2TramaGpsId], [point2Fecha], [point2Lat], [point2Lon], [nroPointHaciaChata],
					[distanciaMt_p1_p2], [velocidadMt_p1_p2], [distanciaAChataMt], [distanciaAChataMtHist], [distanciaEstXVelAChataMt], [distanciaEstXVelAChataMtHist],
					[estadoViaje], [estadoTurnoSAP], [intentoCreacionSAP], [usernameCreacionSAP])
				VALUES 
				(@deviceId, @planta, @fechaTurno, @temporada, @matricula, @nombre, @id,
				 @id, CAST(@fecha AT TIME ZONE 'SA Pacific Standard Time' AS datetime), @lat, @lon,
				 null, null, null, null, 0,
				 null, null, @distanciaAChataP1Mt, CAST(ROUND(@distanciaAChataP1Mt,2) as NVARCHAR(64)), null, 'null',
				 'Detectado', 'Sin crear',0,'');
			 END
		END
		ELSE -- SI EL TURNO EXISTE, APLICAMOS LAS LOGICAS DE NEGOCIO PARA IDENTIFICAR LA EMBARCACION MAS CERCANA
		BEGIN
		PRINT 'EL TURNO ESTA EXISTE - PROCESAMOS';
			IF (@estadoViaje = 'Detectado' OR @estadoViaje = 'Rumbo a descargar') AND (@lat IS NOT NULL AND @lon IS NOT NULL)
			BEGIN
				-- Calculamos la distancia
				SET @geoPoint1 = geography::Point(@lat, @lon, 4326);
				SET @geoPoint2 = geography::Point(@point1Lat, @point1Lon, 4326);

				SET @distanciaMtP1P2 = @geoPoint1.STDistance(@geoPoint2); -- En metros
				-- Calculamos la velocidad convirtiendo la distancia y el tiempo a horas y luego a 1 minuto.
				/*
										Llevarlo a Metros /hora (segundos)	Calcularlo en velocidad mt/segundos (Distancia/3600)
					metros		876		52560								14.60
					segundos	60		3600	
			
			
					metros		1000	48000								13.33
					segundos	75		3600	
			
					metros		1236	48896.7033							13.58
					segundos	91		3600	
				*/

				-- Obtenemos la diferencia de tiempos entre P1 y P2 en segundos
				SET @diferenciaTiempoP1P2seg = DATEDIFF(second,  @point1Fecha, CAST(@fecha AT TIME ZONE 'SA Pacific Standard Time' AS datetime));

				-- Obtenemos la velocidad mt/seg
				SET @velocidadP1P2MtXSeg = @distanciaMtP1P2 / @diferenciaTiempoP1P2seg;

				-- Obtenemos la posicion del GPS referencia de la planta y la distancia en metros para activar el turno.
				SELECT @plantaPoint = geography::Point(lat, lon, 4326), 
					@plantaDistaciaActivarTurno = distanciaActivarTurnoMt
				FROM [dbo].[turnos_automaticos_V2_planta_ubicacion]
				WHERE planta = @planta;

				-- Calculamos la distancia del nuevo punto al punto de la planta
				SET @distanciaAChataP1Mt = @geoPoint1.STDistance(@plantaPoint); -- En metros

				-- Calculamos la distancia tomando como base la velocidad en el proximo minuto
				SET @distanciaEstXVelAChataMt = @distanciaAChataP1Mt - (60 * @velocidadP1P2MtXSeg);

				-- Calculamos la distancia del punto anterior a la planta
				SET @distanciaAChataP2Mt = @geoPoint2.STDistance(@plantaPoint); -- En metros

				--Calculamos los numeros de puntos que van hacia la chata a traves de la medicion de la distancia entre el punto anterior y el nuevo
				--punto. Si es mejor aumenta en 1 los puntos hacia la chata... Si se llega a 3 se cambia el estado porque se confirma que se dirige a descargar
				SET @nroPointHaciaChata = @nroPointHaciaChata + 1;
				IF @distanciaAChataP1Mt < @distanciaAChataP2Mt AND @nroPointHaciaChata = 3
				BEGIN
					SET @estadoViaje = 'Rumbo a descargar';
				END
												
				-- Actualizamos la información del registro
				UPDATE [dbo].[turnos_automaticos_V2_turnos] SET
					[tramasGPSIds] = tramasGPSIds + ' | ' + CAST(@id as NVARCHAR(64)),
					[distanciaMt_p1_p2] = @distanciaMtP1P2,
					[velocidadMt_p1_p2] = @velocidadP1P2MtXSeg,
					[distanciaAChataMt] = @distanciaAChataP1Mt,
					[distanciaAChataMtHist] = [distanciaAChataMtHist] + ' | '+ CAST(ROUND(@distanciaAChataP1Mt,2) as NVARCHAR(64)),
					[distanciaEstXVelAChataMt] = @distanciaEstXVelAChataMt,
					[distanciaEstXVelAChataMtHist] = [distanciaEstXVelAChataMtHist] + ' | '+ CAST(ROUND(@distanciaEstXVelAChataMt,2) as NVARCHAR(64)),
					[nroPointHaciaChata] = @nroPointHaciaChata,
					[estadoViaje] = @estadoViaje,
					[point2TramaGpsId] = [point1TramaGpsId],
					[point2Fecha] = [point1Fecha],
					[point2Lat] = [point1Lat],
					[point2Lon] = [point1Lon],
					[point1TramaGpsId] = @id,
					[point1Fecha] = CAST(@fecha AT TIME ZONE 'SA Pacific Standard Time' AS datetime),
					[point1Lat] = @lat,
					[point1Lon] = @lon
				WHERE [deviceId] = @deviceId
				AND [planta] = @planta
				AND [turnoFecha] = @fechaTurno
				AND [temporada] = @temporada;
			END

		END

		-- Cambiamos el estado de las tramas GPS recibidas menores a la fecha y que esten en estado 1
		UPDATE [dbo].[turnos_automaticos_V2_tramas_gps] SET
		estado = 2
		WHERE planta = @planta
		AND	 deviceId = @deviceId
		AND fecha <= @fecha;
		 
		FETCH NEXT FROM cursor_posicion_actual_v2
		INTO @id, @planta, @fecha, @deviceId, @lat, @lon, @matricula, @nombre, @temporada
	END
	CLOSE cursor_posicion_actual_v2;
	DEALLOCATE cursor_posicion_actual_v2;
		
	-- Priorizamos las embarcaciones que ya llegaron y estan dentro de los 700 metros
	UPDATE TBA SET 
		TBA.[prioridadTurnoEjecucion] = FORMAT(@fechaActual, 'yyyyMMddHHmmss') +'-1-' + CAST(TBB.prioridad AS nvarchar(32)),
		TBA.estadoViaje = 'Activar Turno'
	FROM [dbo].[turnos_automaticos_V2_turnos] TBA
	INNER JOIN(
		SELECT  ROW_NUMBER() OVER(ORDER BY distanciaAChataMt ASC) as prioridad,
				tb1.deviceId, 
				tb1.planta, 
				tb1.turnoFecha, 
				tb1.temporada,
				tb1.matricula, 
				tb1.embarcacion,
				tb1.distanciaAChataMt,
				tb1.distanciaEstXVelAChataMt,
				tb1.estadoViaje,
				tb2.distanciaActivarTurnoMt
		FROM [dbo].[turnos_automaticos_V2_turnos] tb1
		JOIN [dbo].[turnos_automaticos_V2_planta_ubicacion] tb2 ON tb1.planta = tb2.planta
		WHERE tb1.estadoViaje IN ('Detectado','Rumbo a descargar')
		AND tb1.distanciaAChataMt <= tb2.distanciaActivarTurnoMt
	) TBB ON TBA.deviceId = TBB.deviceId AND TBA.planta = TBB.planta AND TBA.turnoFecha = TBB.turnoFecha AND TBA.temporada = TBB.temporada
	
	-- Priorizamos las embarcaciones que estan por llegar y segun el calculo llegan en la siguiente trama por la velocidad que van.
	UPDATE TBA SET 
		TBA.[prioridadTurnoEjecucion] = FORMAT(@fechaActual, 'yyyyMMddHHmmss') +'-2-' + CAST(TBB.prioridad AS nvarchar(32)),
		TBA.estadoViaje = 'Activar Turno'
	FROM [dbo].[turnos_automaticos_V2_turnos] TBA
	INNER JOIN(
		SELECT  ROW_NUMBER() OVER(ORDER BY distanciaAChataMt ASC) as prioridad,
				tb1.deviceId, 
				tb1.planta, 
				tb1.turnoFecha, 
				tb1.temporada,
				tb1.matricula, 
				tb1.embarcacion,
				tb1.distanciaAChataMt,
				tb1.distanciaEstXVelAChataMt,
				tb1.estadoViaje,
				tb2.distanciaActivarTurnoMt
		FROM [dbo].[turnos_automaticos_V2_turnos] tb1
		JOIN [dbo].[turnos_automaticos_V2_planta_ubicacion] tb2 ON tb1.planta = tb2.planta
		WHERE tb1.estadoViaje IN ('Detectado','Rumbo a descargar')
		AND tb1.distanciaEstXVelAChataMt <= tb2.distanciaActivarTurnoMt
	) TBB ON TBA.deviceId = TBB.deviceId AND TBA.planta = TBB.planta AND TBA.turnoFecha = TBB.turnoFecha AND TBA.temporada = TBB.temporada
	
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_turnos_automaticos_V2_eliminar_tramas_gps
AS
BEGIN
	--Insertamos en la tabla historica
	INSERT INTO turnos_automaticos_V2_tramas_gps_historico ([id], [planta], [deviceId], [fecha], [gateway], [name], [lat], [lon], [rssi], [bat], [estado])
	SELECT [id], [planta], [deviceId], [fecha], [gateway], [name], [lat], [lon], [rssi], [bat], [estado] 
	FROM [dbo].[turnos_automaticos_V2_tramas_gps]
	WHERE CAST([fecha] AT TIME ZONE 'SA Pacific Standard Time' AS date) < CAST(DATEADD(HOUR,-24,GETDATE()) as date)
	
	--Eliminamos los registros
	DELETE FROM [dbo].[turnos_automaticos_V2_tramas_gps]
	WHERE CAST([fecha] AT TIME ZONE 'SA Pacific Standard Time' AS date) < CAST(DATEADD(HOUR,-24,GETDATE()) as date)

END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_turnos_automaticos_V2_cancelar_solicitudes_turno]
AS
BEGIN
	UPDATE [dbo].[turnos_automaticos_V2_turnos]
	SET estadoViaje = 'Activar Turno Cancelado',
	estadoTurnoSAP = 'No creado'
	WHERE turnoFecha < DATEADD(DAY, -1, GETDATE())
	AND estadoViaje IN ('Activar Turno', 'Detectado')	
END

/*

TRUNCATE TABLE [dbo].[turnos_automaticos_V2_turnos]

TRUNCATE TABLE [dbo].[turnos_automaticos_V2_tramas_gps]

UPDATE [dbo].[turnos_automaticos_V2_tramas_gps]
SET estado = 2

EXEC dbo.sp_turnos_automaticos_V2_validar_posiciones_embarcaciones


DELETE FROM [dbo].[turnos_automaticos_V2_turnos]
WHERE turnoFecha = '2024-06-06'
*/


SELECT * 
FROM [dbo].[turnos_automaticos_V2_turnos]
WHERE estadoViaje = 'Activar Turno'
ORDER BY [prioridadTurnoEjecucion] ASC

