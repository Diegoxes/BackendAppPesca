USE [dbCovidApp]
GO

/****** Object:  Table [dbo].[modulo]    Script Date: 12/11/2021 11:37:19 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[turno_informe](
	[informeFlota] [nvarchar](255) NOT NULL,
	[turnoNotificado] [bit] NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
PRIMARY KEY CLUSTERED 
(
	[informeFlota] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
