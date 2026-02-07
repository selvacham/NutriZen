-- Create sleep_logs table
create table if not exists public.sleep_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  duration_minutes integer not null,
  quality text check (quality in ('Excellent', 'Good', 'Fair', 'Poor')) not null,
  notes text,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.sleep_logs enable row level security;

-- Create policies
create policy "Users can view their own sleep logs"
  on public.sleep_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sleep logs"
  on public.sleep_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own sleep logs"
  on public.sleep_logs for delete
  using (auth.uid() = user_id);

-- Add goal columns to user_profiles
alter table public.user_profiles 
add column if not exists water_goal_ml integer default 2250,
add column if not exists sleep_goal_hours numeric default 8.0,
add column if not exists bedtime text,
add column if not exists waketime text;
