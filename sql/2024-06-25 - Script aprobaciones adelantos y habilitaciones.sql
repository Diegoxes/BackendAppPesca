CREATE TABLE [dbo].[workflow_template](
	[id] [uniqueidentifier] NOT NULL,
	[nombre] [nvarchar](255) NOT NULL,
	[descripcion] [nvarchar](255) NOT NULL,
	[estado] [bit] NOT NULL DEFAULT 1,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[workflow_template_aprobador](
	[id] [uniqueidentifier] NOT NULL,
	[workflowTemplateId] [uniqueidentifier] NOT NULL,
	[nroAprobacion] int NOT NULL,
	[username] [nvarchar](255) NOT NULL,
	[usernameDisabled] bit NOT NULL,
	[username2] [nvarchar](255) NOT NULL,
	[aprobacionFinal] [bit] NOT NULL,
	[funcionAprobacionFinalScript] [nvarchar](255) NULL,
	[funcionRechazoScript] [nvarchar](255) NULL,
	[estadoAprobado] [nvarchar](32) NOT NULL,
	[estadoRechazado][nvarchar](32) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id], [workflowTemplateId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[workflow_aprobacion](
	[id] [uniqueidentifier] NOT NULL,
	[workflowTemplateId] [uniqueidentifier] NOT NULL,
	[fecha] datetime NOT NULL,
	[nombre] [nvarchar](255) NOT NULL,
	[data][nvarchar](max) NULL,
	[detalle] [nvarchar](max) NULL,
	[estado] [nvarchar](32) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[workflow_aprobacion_aprobador](
	[id] [uniqueidentifier] NOT NULL,
	[workflowAprobacionId] [uniqueidentifier] NOT NULL,
	[workflowTemplateAprobadorId] [uniqueidentifier] NOT NULL,
	[usernameAprobador] [nvarchar](255) NOT NULL,
	[fecha] datetime NOT NULL,
	[detalle] [nvarchar](512) NULL,
	[estado] [nvarchar](32) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id],[workflowAprobacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO