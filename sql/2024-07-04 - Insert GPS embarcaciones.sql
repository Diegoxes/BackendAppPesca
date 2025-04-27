/****** Script for SelectTopNRows command from SSMS  ******/
SELECT TOP (1000) [deviceId]
      ,[temporada]
      ,[matricula]
      ,[nombre]
      ,[createdAt]
      ,[updatedAt]
  FROM [dbo].[turnos_automaticos_V2_devices]


INSERT INTO [dbo].[turnos_automaticos_V2_devices]
([deviceId]
      ,[temporada]
      ,[matricula]
      ,[nombre]
      ,[createdAt]
      ,[updatedAt])
VALUES
('ac1f09fffe0900c0','2024-1','CO-19867-PM','BAMAR VIII', GETDATE(), GETDATE()),
('ac1f09fffe0900ef','2024-1','CE-28791-PM','ISABELITA', GETDATE(), GETDATE()),
('ac1f09fffe090117','2024-1','CE-13680-PM','IVANA B', GETDATE(), GETDATE()),
('ac1f09fffe0900e5','2024-1','CE-15260-PM','MARYLIN II', GETDATE(), GETDATE()),
('ac1f09fffe0900ca','2024-1','CE-16661-PM','BAMAR II', GETDATE(), GETDATE())


INSERT INTO [dbo].[turnos_automaticos_V2_devices]
([deviceId]
      ,[temporada]
      ,[matricula]
      ,[nombre]
      ,[createdAt]
      ,[updatedAt])
VALUES
('ac1f09fffe090127','2024-1','CE-15261-PM','YAGODA B', GETDATE(), GETDATE()),
('ac1f09fffe09010b','2024-1','CE-13681-PM','JADRANKA', GETDATE(), GETDATE())


/*
PRUEBA TEMPORADA 2024-2
*/


INSERT INTO [dbo].[turnos_automaticos_V2_devices]
([deviceId]
      ,[temporada]
      ,[matricula]
      ,[nombre]
      ,[createdAt]
      ,[updatedAt])
VALUES
('ac1f09fffe090115','2024-2','CO-20658-CM','APOSTOL SANTIAGO', GETDATE(), GETDATE()),
('ac1f09fffe09011a','2024-2','PL-19884-PM','DON ROLO - I', GETDATE(), GETDATE()),
('ac1f09fffe0900f0','2024-2','PL-2264-CM','EL NAYLAMP', GETDATE(), GETDATE()),
('ac1f09fffe090105','2024-2','PL-11902-CM','ALBERTO UNO', GETDATE(), GETDATE()),
('ac1f09fffe0900f9','2024-2','PL-29764-CM','NIÑO DEL MILAGRO III', GETDATE(), GETDATE()),
('ac1f09fffe090122','2024-2','PL-4334-CM','MI ALBERTO II', GETDATE(), GETDATE()),
('ac1f09fffe0900d0','2024-2','PL-4324-CM','JUAN CARLOS', GETDATE(), GETDATE()),
('ac1f09fffe06d197','2024-2','PL-10603-CM','MI ALFREDO', GETDATE(), GETDATE()),
('ac1f09fffe09012e','2024-2','PL-17740-CM','MI BARTOLITA', GETDATE(), GETDATE()),
('ac1f09fffe09010c','2024-2','PL-2256-CM','NIÑO DEL MILAGRO', GETDATE(), GETDATE())