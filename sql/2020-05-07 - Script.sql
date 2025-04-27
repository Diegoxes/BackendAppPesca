alter table residuos_solidos_imagen ADD base64header [nvarchar](255) NULL;
alter table despacho_combustible_imagen ADD base64header [nvarchar](255) NULL;
alter table descarga_mp_imagen ADD base64header [nvarchar](255) NULL;

alter table usuario ADD telefono [nvarchar](32) NOT NULL DEFAULT '';

update tipo_cuenta set nombre = 'Visitante' where id = 'INV'

INSERT [dbo].[modulo] ([id], [nombre], [createdAt], [updatedAt], [padreId], [hierarchyLevel]) VALUES (N'covidapp-administracion-seguridad-usuarios-ver', N'Ver', CAST(N'2020-04-27T03:01:19.7770000+00:00' AS DateTimeOffset), CAST(N'2020-04-27T03:01:38.5170000+00:00' AS DateTimeOffset), N'covidapp-administracion-seguridad-usuarios', 5)
