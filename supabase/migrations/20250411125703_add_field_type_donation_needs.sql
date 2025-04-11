-- Add "type" column to donation_needs table with constraint
ALTER TABLE donation_needs
ADD COLUMN type TEXT CHECK (type IN ('blood', 'supplies', 'volunteers'));

-- Add comment explaining the purpose of the "type" column
COMMENT ON COLUMN donation_needs.type IS 'References the type of the donation: blood, supplies, or volunteers';
