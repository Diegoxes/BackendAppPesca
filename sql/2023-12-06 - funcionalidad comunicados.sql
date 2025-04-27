/****** Object:  Table [dbo].[comunicado]    Script Date: 06/12/2023 09:05:43 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[comunicado](
	[id] [uniqueidentifier] NOT NULL,
	[fechaPublicacion] [datetime] NULL,
	[titulo] [nvarchar](255) NOT NULL,
	[textoNotificacion] [nvarchar](255) NOT NULL,
	[mensaje] [text],
	[destinoTipoCuentaID] [char](3) NULL,
	[destinoUsuarios] [text],
	[tieneImagen] [bit] NOT NULL,
	[urlImagen] [nvarchar](255) NULL,
	[tieneArchivo] [bit] NOT NULL,
	[urlArchivo] [nvarchar](255) NULL,
	[tieneVideo] [bit] NOT NULL,
	[urlVideo] [nvarchar](255) NULL,
	[estadoPublicacion] [char](3) NOT NULL,
	[estado] [bit] NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[comunicado] ADD  DEFAULT (newid()) FOR [id]
GO

ALTER TABLE [dbo].[comunicado] ADD  DEFAULT ((1)) FOR [estado]
GO

CREATE TABLE [dbo].[comunicado_view](
	[comunicadoId] [uniqueidentifier] NOT NULL,
	[username] [nvarchar](255) NOT NULL,
	[visto] [bit] NOT NULL,
	[fechaVisto] [datetime] NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[comunicadoId] ASC, [username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-administracion-comunicados','Comunicados',GETDATE(),GETDATE(),'covidapp-administracion',3)

INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-administracion-comunicados-registrar','Registrar',GETDATE(),GETDATE(),'covidapp-administracion-comunicados',4)

INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-administracion-comunicados-editar','Editar',GETDATE(),GETDATE(),'covidapp-administracion-comunicados',4)

INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-administracion-comunicados-eliminar','Eliminar',GETDATE(),GETDATE(),'covidapp-administracion-comunicados',4)

INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-administracion-comunicados-ver','Ver',GETDATE(),GETDATE(),'covidapp-administracion-comunicados',4)

INSERT INTO modulo (id, nombre, createdAt, updatedAt, padreId, hierarchyLevel)
VALUES ('covidapp-comunicados','Comunicados',GETDATE(),GETDATE(),'covidapp',3)


ALTER TABLE dbo.usuario
ADD 
	[notificarApp] [bit] NOT NULL DEFAULT 1,
	[notificar2doPlano] [bit] NOT NULL DEFAULT 1,
	[notificarEmail] [bit] NOT NULL DEFAULT 1,
	[notificarSMS] [bit] NOT NULL DEFAULT 1,
	[notificarWS] [bit] NOT NULL DEFAULT 1
GO