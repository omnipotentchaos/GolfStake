-- Supabase Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text not null,
  avatar_url text,
  phone text,
  country text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null check (status in ('active', 'inactive', 'cancelled', 'lapsed')),
  price_paid numeric not null,
  charity_percentage integer default 10 check (charity_percentage >= 10 and charity_percentage <= 100),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  renewal_date timestamp with time zone,
  stripe_subscription_id text
);

-- Charities table
create table public.charities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  image_url text,
  website_url text,
  is_featured boolean default false,
  category text,
  upcoming_events jsonb default '[]'::jsonb,
  total_received numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User-Charities relation (which charity the user selected)
create table public.user_charities (
  user_id uuid references public.profiles(id) on delete cascade not null,
  charity_id uuid references public.charities(id) on delete cascade not null,
  contribution_percentage integer default 10,
  selected_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, charity_id)
);

-- Donations table
create table public.donations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  charity_id uuid references public.charities(id) on delete cascade not null,
  amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Scores table (Golf scores)
create table public.scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer check (score >= 1 and score <= 45) not null,
  played_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Draws table (Monthly draw config)
create table public.draws (
  id uuid default uuid_generate_v4() primary key,
  draw_date timestamp with time zone not null,
  status text not null check (status in ('scheduled', 'simulated', 'published')),
  draw_type text not null check (draw_type in ('random', 'algorithmic')),
  winning_numbers integer[] check (array_length(winning_numbers, 1) = 5),
  prize_pool_total numeric default 0,
  jackpot_rollover numeric default 0,
  created_by uuid references public.profiles(id) on delete set null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Draw entries (User's entry at time of draw)
create table public.draw_entries (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scores_snapshot integer[] not null check (array_length(scores_snapshot, 1) <= 5),
  match_count integer,
  prize_won numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Winners table (Actual verified winners)
create table public.winners (
  id uuid default uuid_generate_v4() primary key,
  draw_entry_id uuid references public.draw_entries(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  draw_id uuid references public.draws(id) on delete cascade not null,
  match_type text not null check (match_type in ('5-match', '4-match', '3-match')),
  prize_amount numeric not null,
  proof_image_url text,
  verification_status text default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid')),
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.charities enable row level security;
alter table public.user_charities enable row level security;
alter table public.donations enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.draw_entries enable row level security;
alter table public.winners enable row level security;

-- Policies (Basic defaults, adjust based on deeper requirements)
-- Profiles: Users can read/update their own profile, admins can read all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
-- Note: actual admin policies need role check, omitted for brevity
