DELETE FROM chata
GO

INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('PH1','H101','Chata PH1',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('PH4','H101','Chata PH4',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('PH2','H102','Chata PH2',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('PH5','H102','Chata PH5',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('PH3','H105','Chata PH3',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('PH8','H106','Chata PH8',GETDATE(),GETDATE())
INSERT INTO chata(id,plantaId,nombre,createdAt,updatedAt) VALUES('PH99','H104','Chata CARMEN_II',GETDATE(),GETDATE())
GO

ALTER TABLE planta
ADD estado [bit] NOT NULL DEFAULT 1
GO

UPDATE planta SET estado = 0 WHERE id NOT IN ('H101','H102','H105')
GO

CREATE TABLE [dbo].tolva(
	id [nvarchar](10) PRIMARY KEY NOT NULL,
	chataId [nvarchar](4) NOT NULL,
	nombre [nvarchar](128) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].tolva  WITH CHECK ADD FOREIGN KEY(chataId)
REFERENCES [dbo].chata ([id])
ON DELETE CASCADE
GO

INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH99-01','PH1','Tolva 1-N',GETDATE(),GETDATE())
INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH1-01','PH1','Tolva 1-S',GETDATE(),GETDATE())
INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH2-02','PH2','Tolva 2-S',GETDATE(),GETDATE())
INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH3-01','PH3','Tolva 1-N',GETDATE(),GETDATE())
INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH3-02','PH3','Tolva 2-S',GETDATE(),GETDATE())
INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH4-02','PH4','Tolva 2-N',GETDATE(),GETDATE())
INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH4-01','PH4','Tolva 1-S',GETDATE(),GETDATE())
INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH5-01','PH5','Tolva 1-N',GETDATE(),GETDATE())
INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH5-02','PH5','Tolva 2-S',GETDATE(),GETDATE())
INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH8-01','PH8','Tolva 1-N',GETDATE(),GETDATE())
INSERT INTO tolva(id,chataId,nombre,createdAt,updatedAt) VALUES('PH8-02','PH8','Tolva 2-S',GETDATE(),GETDATE())
GO


ALTER TABLE [dbo].descarga_mp
ADD tolvaId [nvarchar](10) NOT NULL,
tolvaNombre [nvarchar](128) NOT NULL
GO