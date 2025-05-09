
CREATE TABLE [dbo].tipo_cuenta(
	id [char](3) NOT NULL,
	nombre [nvarchar](120) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO tipo_cuenta VALUES
('TRA','Trabajador',GETDATE(),GETDATE()),
('CON','Contratista',GETDATE(),GETDATE()),
('ARM','Armador',GETDATE(),GETDATE()),
('FAM','Familiar',GETDATE(),GETDATE()),
('INV','Invitado',GETDATE(),GETDATE())
GO

CREATE TABLE [dbo].tipo_documento(
	id [char](3) NOT NULL,
	nombre [nvarchar](120) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO tipo_documento VALUES
('DNI','DNI',GETDATE(),GETDATE()),
('CE','Carnet Extranjería',GETDATE(),GETDATE())
GO

CREATE TABLE [dbo].[usuario](
	[username] [nvarchar](255) UNIQUE NOT NULL ,
	[nombresApellidos] [nvarchar](255) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[tipoDocumentoId] [char](3) NOT NULL,
	[numeroDocumento] [nvarchar](32) NOT NULL,
	[tipoCuentaId] [char](3) NOT NULL,
	[tipoDocumentoIdEmpleado] [char](3) NULL,
	[numeroDocumentoEmpleado] [nvarchar](32) NULL,
	[nombresApellidosEmpleado] [nvarchar](255) NULL,
	[rucEmpresa] [nvarchar](11) NULL,
	[razonSocialEmpresa] [nvarchar](255) NULL,
	[terminos] [bit] NOT NULL,
	[password] [nvarchar](1024) NOT NULL,
	[iv] [nvarchar](512) NOT NULL,
	[superAdmin] [bit] NOT NULL,
	[cuentaConfirmada] [bit] NOT NULL DEFAULT 0,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[usuario]  WITH CHECK ADD FOREIGN KEY([tipoCuentaId])
REFERENCES [dbo].tipo_cuenta ([id])
GO

ALTER TABLE [dbo].[usuario]  WITH CHECK ADD FOREIGN KEY([tipoDocumentoId])
REFERENCES [dbo].tipo_documento ([id])
GO

ALTER TABLE [dbo].[usuario]  WITH CHECK ADD FOREIGN KEY([tipoDocumentoIdEmpleado])
REFERENCES [dbo].tipo_documento ([id])
GO

CREATE TABLE [dbo].[modulo](
	[id] [nvarchar](255) NOT NULL,
	[nombre] [nvarchar](255) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL,
	[padreId] [nvarchar](255) NULL,
	[hierarchyLevel] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[modulo] ADD  CONSTRAINT [DF_modulo_hierarchyLevel]  DEFAULT ((0)) FOR [hierarchyLevel]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Id del modulo' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'modulo', @level2type=N'COLUMN',@level2name=N'id'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Nombre del modulo' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'modulo', @level2type=N'COLUMN',@level2name=N'nombre'
GO

INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp', N'Covid App', CAST(N'2020-04-23T17:59:18.3400000+00:00' AS DateTimeOffset), CAST(N'2020-04-23T17:59:18.3400000+00:00' AS DateTimeOffset), NULL, 1)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-administracion', N'Administración', CAST(N'2020-04-23T17:59:18.3400000+00:00' AS DateTimeOffset), CAST(N'2020-04-23T17:59:18.3400000+00:00' AS DateTimeOffset), N'covidapp', 2)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-administracion-seguridad', N'Seguridad', CAST(N'2020-04-23T17:59:18.3400000+00:00' AS DateTimeOffset), CAST(N'2020-04-23T17:59:18.3400000+00:00' AS DateTimeOffset), N'covidapp-administracion', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-administracion-seguridad-modulos', N'Módulos', CAST(N'2020-04-23T17:59:18.3400000+00:00' AS DateTimeOffset), CAST(N'2020-04-23T17:59:18.3400000+00:00' AS DateTimeOffset), N'covidapp-administracion-seguridad', 4)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-administracion-seguridad-usuarios', N'Usuarios', CAST(N'2020-04-23T17:59:18.3400000+00:00' AS DateTimeOffset), CAST(N'2020-04-23T17:59:18.3400000+00:00' AS DateTimeOffset), N'covidapp-administracion-seguridad', 4)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-administracion-seguridad-usuarios-confirmar', N'Confirmar', CAST(N'2020-04-27T03:01:54.6850000+00:00' AS DateTimeOffset), CAST(N'2020-04-27T03:01:54.6850000+00:00' AS DateTimeOffset), N'covidapp-administracion-seguridad-usuarios', 5)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-administracion-seguridad-usuarios-editar', N'Editar', CAST(N'2020-04-27T03:01:33.1750000+00:00' AS DateTimeOffset), CAST(N'2020-04-27T03:01:33.1750000+00:00' AS DateTimeOffset), N'covidapp-administracion-seguridad-usuarios', 5)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-administracion-seguridad-usuarios-eliminar', N'Eliminar', CAST(N'2020-04-27T03:02:11.1630000+00:00' AS DateTimeOffset), CAST(N'2020-04-27T03:02:11.1630000+00:00' AS DateTimeOffset), N'covidapp-administracion-seguridad-usuarios', 5)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-administracion-seguridad-usuarios-registrar', N'Registrar', CAST(N'2020-04-27T03:01:19.7770000+00:00' AS DateTimeOffset), CAST(N'2020-04-27T03:01:38.5170000+00:00' AS DateTimeOffset), N'covidapp-administracion-seguridad-usuarios', 5)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-comunicate', N'Comunicate', CAST(N'2020-04-25T17:38:43.6380000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:38:43.6380000+00:00' AS DateTimeOffset), N'covidapp', 2)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-comunicate-directoriohayduk', N'Directorio Hayduk', CAST(N'2020-04-25T17:39:03.1740000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:39:03.1740000+00:00' AS DateTimeOffset), N'covidapp-comunicate', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-comunicate-numerosemergencia', N'Números de Emergencia', CAST(N'2020-04-25T17:39:21.9790000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:39:21.9790000+00:00' AS DateTimeOffset), N'covidapp-comunicate', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-informate', N'Informate', CAST(N'2020-04-25T17:37:01.1280000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:37:01.1280000+00:00' AS DateTimeOffset), N'covidapp', 2)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-informate-infocovid', N'Información sobre COVID-19', CAST(N'2020-04-25T17:38:04.0040000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:38:04.0040000+00:00' AS DateTimeOffset), N'covidapp-informate', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-informate-protocolosanitario', N'Protocolo Sanitario', CAST(N'2020-04-25T17:37:28.0700000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:37:28.0700000+00:00' AS DateTimeOffset), N'covidapp-informate', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-informate-reportes', N'Reportes', CAST(N'2020-04-25T17:38:28.9140000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:38:28.9140000+00:00' AS DateTimeOffset), N'covidapp-informate', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-mipesca', N'Mi Pesca', CAST(N'2020-04-25T17:39:44.0370000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:39:44.0370000+00:00' AS DateTimeOffset), N'covidapp', 2)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-mipesca-descargamp', N'Descarga Materia Prima', CAST(N'2020-04-25T17:40:00.5720000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:40:00.5720000+00:00' AS DateTimeOffset), N'covidapp-mipesca', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-mipesca-despachocombustible', N'Despacho Combustible', CAST(N'2020-04-25T17:40:16.4360000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:40:16.4360000+00:00' AS DateTimeOffset), N'covidapp-mipesca', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-mipesca-residuossolidos', N'Acta de Residuos Solidos', CAST(N'2020-04-25T17:40:44.0230000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:40:44.0230000+00:00' AS DateTimeOffset), N'covidapp-mipesca', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-misalud', N'Mi salud', CAST(N'2020-04-25T17:35:37.0930000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:35:37.0930000+00:00' AS DateTimeOffset), N'covidapp', 2)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-misalud-declaracion', N'Declaración de Salud', CAST(N'2020-04-25T17:36:08.6620000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:36:08.6620000+00:00' AS DateTimeOffset), N'covidapp-misalud', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-misalud-estado', N'Estado de Salud', CAST(N'2020-04-25T17:36:27.0360000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:36:27.0360000+00:00' AS DateTimeOffset), N'covidapp-misalud', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-misalud-seguimiento', N'Seguimiento de Salud', CAST(N'2020-04-25T17:36:45.6010000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:36:45.6010000+00:00' AS DateTimeOffset), N'covidapp-misalud', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-operaciones', N'Operaciones', CAST(N'2020-04-25T17:40:53.5600000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:40:53.5600000+00:00' AS DateTimeOffset), N'covidapp', 2)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-operaciones-descargamp', N'Descarga Materia Prima', CAST(N'2020-04-25T17:41:09.2670000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:41:09.2670000+00:00' AS DateTimeOffset), N'covidapp-operaciones', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-operaciones-despachocombustible', N'Despacho Combustible', CAST(N'2020-04-25T17:41:25.3870000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:41:25.3870000+00:00' AS DateTimeOffset), N'covidapp-operaciones', 3)
INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-operaciones-residuossolidos', N'Acta de Residuos Solidos', CAST(N'2020-04-25T17:41:49.6010000+00:00' AS DateTimeOffset), CAST(N'2020-04-25T17:41:49.6010000+00:00' AS DateTimeOffset), N'covidapp-operaciones', 3)
GO

CREATE TABLE [dbo].[usuario_modulo](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[username] [nvarchar](255) NOT NULL,
	[moduloId] [nvarchar](255) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Id de la relación' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'usuario_modulo', @level2type=N'COLUMN',@level2name=N'id'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'username' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'usuario_modulo', @level2type=N'COLUMN',@level2name=N'username'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'ID del modulo' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'usuario_modulo', @level2type=N'COLUMN',@level2name=N'moduloId'
GO

CREATE TABLE [dbo].[log_acceso](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[username] [nvarchar](255) NOT NULL,
	[fecha] [datetime] NOT NULL,
	[moduloId] [nvarchar](255) NOT NULL,
	[detalle] [nvarchar](512) NULL,
	[cant] [int] NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[log_acceso] ADD  DEFAULT (getdate()) FOR [fecha]
GO

ALTER TABLE [dbo].[log_acceso] ADD  DEFAULT ((1)) FOR [cant]
GO

ALTER TABLE [dbo].[log_acceso] ADD  DEFAULT (getdate()) FOR [createdAt]
GO

ALTER TABLE [dbo].[log_acceso] ADD  DEFAULT (getdate()) FOR [updatedAt]
GO

