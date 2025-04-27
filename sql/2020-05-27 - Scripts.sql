ALTER TABLE tipo_cuenta
ADD estado bit NOT NULL DEFAULT 1

UPDATE tipo_cuenta SET nombre = 'Trabajador Hayduk' where id = 'TRA'
UPDATE tipo_cuenta SET estado = 0 where id NOT IN ('TRA', 'ARM')