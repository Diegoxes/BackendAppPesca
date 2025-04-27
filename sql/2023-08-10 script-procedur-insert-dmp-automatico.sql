CREATE PROCEDURE [dbo].SP_INSERTAR_DESCARGA_MP 
	  @informeflota nvarchar(255) 
	, @armadorId nvarchar(255)
	, @armadorRuc nvarchar(255)
	, @armadorNombre nvarchar(255)
	, @armadorTelefono nvarchar(255)
	, @armadorEmail nvarchar(255)
	, @embarcacionId nvarchar(255)
	, @embarcacionMatricula nvarchar(255)
	, @embarcacionNombre nvarchar(255)
	, @fechaDescarga nvarchar(255)
	, @plantaId nvarchar(255)
	, @chataId nvarchar(11)
	, @tolvaId nvarchar(10)
	, @estadoProceso char(3)
AS
BEGIN
	DECLARE @id uniqueidentifier
	SET @id = NEWID()

	DECLARE @fecha datetimeoffset(7)
	SET @fecha = GETDATE()

	DECLARE @estado bit
	SET @estado = 1

	DECLARE @plantaNombre nvarchar(255)
	DECLARE @chataNombre nvarchar(255)
	DECLARE @tolvaNombre nvarchar(255)
	
	SET @plantaNombre = (SELECT tb1.nombre FROM [dbo].[planta] tb1 WHERE tb1.id = @plantaId)

	IF (@chataId IS NULL)
		SET @chataId = (SELECT TOP 1 id FROM [dbo].[chata] WHERE plantaId = @plantaId ORDER BY id ASC)
	
	SET @chataNombre = (SELECT tb1.nombre FROM [dbo].[chata] tb1 WHERE tb1.id = @chataId)

	IF (@tolvaId IS NULL)
		SET @tolvaId = (SELECT TOP 1 id FROM [dbo].[tolva] WHERE [chataId] = @chataId ORDER BY id ASC)

	SET @tolvaNombre = (SELECT tb1.nombre FROM [dbo].[tolva] tb1 WHERE tb1.id = @tolvaId)

	BEGIN TRY  
		INSERT INTO [dbo].[descarga_mp]
		([id]
		,[informeFlota]
		,[armadorId]
		,[armadorRuc]
		,[armadorNombre]
		,[embarcacionId]
		,[embarcacionMatricula]
		,[embarcacionNombre]
		,[fechaDescarga]
		,[plantaId]
		,[plantaNombre]
		,[chataId]
		,[chataNombre]
		,[tolvaId]
		,[tolvaNombre]
		,[estadoProceso]
		,[armadorTelefono]
		,[armadorEmail]
		,[createdAt]
		,[updatedAt]
		,[estado])
		VALUES
		(@id
		,@informeflota
		,@armadorId
		,@armadorRuc
		,@armadorNombre
		,@embarcacionId
		,@embarcacionMatricula
		,@embarcacionNombre
		,@fechaDescarga
		,@plantaId
		,@plantaNombre
		,@chataId
		,@chataNombre
		,@tolvaId
		,@tolvaNombre
		,@estadoProceso
		,@armadorTelefono
		,@armadorEmail
		,@fecha
		,@fecha
		,@estado)

		RETURN 1
	END TRY  
	BEGIN CATCH  
		RETURN 9
	END CATCH;   

END
GO

CREATE PROCEDURE [dbo].SP_CERRAR_DESCARGA_MP 
	  @informeflota nvarchar(255) 
	, @fechaDescarga nvarchar(255)
	, @plantaId nvarchar(255)
	, @chataId nvarchar(11)
	, @tolvaId nvarchar(10)
AS
BEGIN
	DECLARE @id uniqueidentifier
	SET @id = (SELECT id FROM [dbo].[descarga_mp] tb1 WHERE tb1.informeFlota = @informeflota)

	DECLARE @fecha datetimeoffset(7)
	SET @fecha = GETDATE()

	DECLARE @estadoProceso char(3)
	SET @estadoProceso = 'FIN'

	DECLARE @plantaNombre nvarchar(255)
	DECLARE @chataNombre nvarchar(255)
	DECLARE @tolvaNombre nvarchar(255)
	
	SET @plantaNombre = (SELECT tb1.nombre FROM [dbo].[planta] tb1 WHERE tb1.id = @plantaId)

	IF (@chataId IS NULL)
		SET @chataId = (SELECT TOP 1 id FROM [dbo].[chata] WHERE plantaId = @plantaId ORDER BY id ASC)
	
	SET @chataNombre = (SELECT tb1.nombre FROM [dbo].[chata] tb1 WHERE tb1.id = @chataId)

	IF (@tolvaId IS NULL)
		SET @tolvaId = (SELECT TOP 1 id FROM [dbo].[tolva] WHERE [chataId] = @chataId ORDER BY id ASC)

	SET @tolvaNombre = (SELECT tb1.nombre FROM [dbo].[tolva] tb1 WHERE tb1.id = @tolvaId)

	BEGIN TRY  

		UPDATE [dbo].[descarga_mp] SET
		 [fechaDescarga] = @fechaDescarga
		,[plantaId] = @plantaId
		,[plantaNombre] = @plantaNombre
		,[chataId] = @chataId
		,[chataNombre] = @chataNombre
		,[tolvaId] = @tolvaId
		,[tolvaNombre] = @tolvaNombre
		,[estadoProceso] = @estadoProceso
		,[updatedAt] = @fecha
		WHERE [id] = @id

		RETURN 1
	END TRY  
	BEGIN CATCH  
		RETURN 9
	END CATCH;   

END
GO

CREATE PROCEDURE [dbo].[SP_CERRAR_DMP_MAYORES_1_SEMANA_ABIERTOS]
AS
BEGIN
	UPDATE [dbo].[descarga_mp]
	SET 
	estadoProceso = 'FIN'
	WHERE id IN (SELECT [id]
	FROM [dbo].[descarga_mp]
	WHERE fechaDescarga <= DATEADD(day,-7,GETDATE())
	AND estadoProceso = 'INI'
	AND estado = 1)

END

GO

INSERT INTO [dbo].[tolva] ([id]
      ,[chataId]
      ,[nombre]
      ,[createdAt]
      ,[updatedAt])
  VALUES ('PH1-02','PH1','Tolva 2',GETDATE(), GETDATE()),
	('PH1-03','PH1','Tolva 3',GETDATE(), GETDATE()),
	('PH2-03','PH2','Tolva 3',GETDATE(), GETDATE()),
	('PH2-01','PH2','Tolva 1',GETDATE(), GETDATE());