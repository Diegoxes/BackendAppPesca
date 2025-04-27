CREATE TABLE [dbo].[usuario_empresas] (
    [id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [username] VARCHAR(255) NOT NULL,
    [razonSocial] NVARCHAR(255) NOT NULL,
    [ruc] NVARCHAR(255) NOT NULL,
    [estado] NVARCHAR(255) NOT NULL,
    [favorita] BIT NOT NULL,
    [detalles] NVARCHAR(MAX) NOT NULL,
    [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [updatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [fecha] DATETIME NULL,
    
);
go

CREATE TABLE [dbo].[workflow_aprobacion_usuarioEmpresas_aprobador] (
    [id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [worflowAprobacionUsuarioEmpresasId] UNIQUEIDENTIFIER NOT NULL,
    [usernameAprobador] VARCHAR(255) NOT NULL,
    [fecha] DATETIME NOT NULL,
    [detalle] VARCHAR(255) NULL,
    [estado] VARCHAR(255) NULL,
    [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [updatedAt] DATETIME NOT NULL DEFAULT GETDATE()
);
