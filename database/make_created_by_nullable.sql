-- Drop foreign key constraint on created_by
ALTER TABLE missions 
DROP FOREIGN KEY missions_ibfk_2;

-- Make created_by nullable in missions table
ALTER TABLE missions 
MODIFY COLUMN created_by INT NULL;
