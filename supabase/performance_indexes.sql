-- Add indexes to improve Supabase performance for Resume queries
create index if not exists resumes_id_idx on resumes (id);

create index if not exists resumes_user_id_idx on resumes (user_id);

create index if not exists jobs_created_at_idx on jobs (created_at desc);
-- End of migration