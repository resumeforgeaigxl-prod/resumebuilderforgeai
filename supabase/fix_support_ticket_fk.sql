-- ============================================================
-- ResumeForge AI — Fix Support Ticket FK Constraint
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================
-- Root Cause: support_tickets.user_id was referencing auth.users(id)
-- but this app uses a custom 'users' table with its own UUIDs.
-- The FK violation caused every ticket insert to fail with a 500.
-- ============================================================

-- Step 1: Drop the broken FK constraint (references auth.users)
ALTER TABLE support_tickets
DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;

-- Step 2: Add the correct FK reference to the custom users table
--         ON DELETE SET NULL so tickets survive if a user is deleted
ALTER TABLE support_tickets
ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL;

-- Step 3: Make sure the service-role INSERT policy exists (no RLS block)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'support_tickets'
          AND policyname = 'service_role_insert_support_tickets'
    ) THEN
        CREATE POLICY "service_role_insert_support_tickets"
            ON support_tickets
            FOR INSERT
            WITH CHECK (true);
    END IF;
END $$;

-- Step 4: Drop the old incomplete "service role full access" policy if present
-- (it used USING(true) only, which doesn't cover INSERT)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'support_tickets'
          AND policyname = 'Service role full access support_tickets'
    ) THEN
        DROP POLICY "Service role full access support_tickets" ON support_tickets;
    END IF;
END $$;

-- Step 5: Ensure the full-access policy covers all operations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'support_tickets'
          AND policyname = 'service_role_all_support_tickets'
    ) THEN
        CREATE POLICY "service_role_all_support_tickets"
            ON support_tickets
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Step 6: Verify — should show the corrected FK referencing 'users'
SELECT tc.constraint_name, ccu.table_name AS referenced_table
FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE
    tc.table_name = 'support_tickets'
    AND tc.constraint_type = 'FOREIGN KEY';