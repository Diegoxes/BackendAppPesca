-- DB powerbi

/****** Object:  Table [rpa].[sitrapesca_faena]    Script Date: 11/08/2023 08:25:22 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

--DROP TABLE [eureka].[flota_pesca6_gps]
--GO

CREATE TABLE [eureka].[flota_pesca6_gps](
	[id] [nvarchar](64) NOT NULL,
	[nro_id] [nvarchar](32) NOT NULL,
	[nro_reg_emb] [nvarchar](32) NOT NULL,
	[fecha] [nvarchar](64) NOT NULL,
	[hora] [nvarchar](64) NOT NULL,
	[fecha_hora] [datetime] NOT NULL,
	[latitud] [float] NOT NULL,
	[longitud] [float] NOT NULL,
	[velocidad] [float] NULL,
	[rumbo] [float] NULL,
	[distancia_costa] [float] NULL,
	[matricula] [nvarchar](128) NOT NULL,
	[embarcacion] [nvarchar](255) NOT NULL,
	[fecha_carga] [datetime] NOT NULL
) ON [PRIMARY]
GO

--DROP TABLE [eureka].[flota_pesca6_gps_historico]
--GO

CREATE TABLE [eureka].[flota_pesca6_gps_historico](
	[id] [nvarchar](64) NOT NULL,
	[nro_id] [nvarchar](32) NOT NULL,
	[nro_reg_emb] [nvarchar](32) NOT NULL,
	[fecha] [nvarchar](64) NOT NULL,
	[hora] [nvarchar](64) NOT NULL,
	[fecha_hora] [datetime] NOT NULL,
	[latitud] [float] NOT NULL,
	[longitud] [float] NOT NULL,
	[velocidad] [float] NULL,
	[rumbo] [float] NULL,
	[distancia_costa] [float] NULL,
	[matricula] [nvarchar](128) NOT NULL,
	[embarcacion] [nvarchar](255) NOT NULL,
	[fecha_carga] [datetime] NOT NULL
) ON [PRIMARY]
GO

-- DB eurekabi2

SET IDENTITY_INSERT [dbo].[job] ON
INSERT INTO [dbo].[job] ([id]
    ,[nombre]
    ,[descripcion]
    ,[createdAt]
    ,[updatedAt])
VALUES (13,'Job Carga P6 GPS','Carga de las posiciones de GPS del software Pesca 6',GETDATE(),GETDATE())
SET IDENTITY_INSERT [dbo].[job] OFF


DELETE FROM [rpa].[flota_pesca6_gps]
WHERE fecha_hora <= DATEADD(day,-3,GETDATE())

SELECT id
FROM [rpa].[flota_pesca6_gps]
WHERE id IN ('');