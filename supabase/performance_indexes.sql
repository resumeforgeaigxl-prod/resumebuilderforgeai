-- Add indexes to improve Supabase performance for Resume queries
create index if not exists resumes_id_idx on resumes (id);

create index if not exists resumes_user_id_idx on resumes (user_id);
-- End of migration