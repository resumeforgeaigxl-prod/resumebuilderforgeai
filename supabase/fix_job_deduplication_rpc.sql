-- RPC to deduplicate jobs based on (title, company, location)
CREATE OR REPLACE FUNCTION deduplicate_jobs()
RETURNS TABLE (deleted_count BIGINT) AS $$
DECLARE
    rows_deleted BIGINT;
BEGIN
    WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY title, company, location 
                   ORDER BY created_at DESC, id
               ) as row_num
        FROM jobs
    )
    DELETE FROM jobs
    WHERE id IN (
        SELECT id FROM duplicates WHERE row_num > 1
    );

    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RETURN QUERY SELECT rows_deleted;
END;
$$ LANGUAGE plpgsql;
