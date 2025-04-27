INSERT INTO [dbo].[usuario_empresas] ([id], [username],[razonSocial],[ruc],[estado],[favorita],[detalles],[createdAt],[updatedAt],[fecha])
SELECT NEWID(), username, razonSocialEmpresa, rucEmpresa, 'Aprobada', 1, '',GETDATE(),GETDATE(),GETDATE()
FROM [dbo].[usuario]
WHERE rucEmpresa IS NOT NULL OR rucEmpresa != ''