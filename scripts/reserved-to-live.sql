-- One-off data migration (run once after the reservation lifecycle change).
-- Return all currently-reserved artworks to live and clear reservation timestamps.
UPDATE "Artwork" SET "status" = 'listed', "reservedAt" = NULL WHERE "status" = 'reserved';
