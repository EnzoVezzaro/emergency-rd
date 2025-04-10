-- Add upload_id column to victims table
ALTER TABLE victims
ADD COLUMN upload_id UUID REFERENCES uploads(id);

-- Comment explaining the change
COMMENT ON COLUMN victims.upload_id IS 'References the upload that created this victim record';
