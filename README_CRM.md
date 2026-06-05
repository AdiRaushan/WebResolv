# WebResolv CRM Dashboard Integration & Setup Guide

This guide explains how to connect a live database (Supabase) to your React CRM Dashboard, set up the database schema, run the local development server, and deploy updates to your domain.

---

## 1. Supabase Database Setup

Follow these steps to connect a live database backend:

1. **Create a Free Account**: Go to [Supabase](https://supabase.com/) and create a new project.
2. **Retrieve API Credentials**:
   - In your Supabase dashboard, navigate to **Settings (cog icon) -> API**.
   - Copy the **Project URL** and the **anon (public) API Key**.
3. **Set Up Database Tables**:
   - Go to the **SQL Editor** in the left menu.
   - Click **New Query** and paste the SQL script below to create the necessary tables with row-level security enabled:

```sql
-- 1. LEADS TABLE
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  contact_person text,
  phone text,
  whatsapp text,
  email text,
  website text,
  google_business text,
  industry text,
  city text,
  notes text,
  deal_value numeric default 0,
  source text,
  status text default 'new_lead',
  created_date timestamp with time zone default timezone('utc'::text, now()) not null,
  last_contact timestamp with time zone,
  next_follow_up timestamp with time zone,
  user_id uuid references auth.users(id) default auth.uid()
);

-- Enable Row Level Security (so users only see their own CRM leads)
alter table public.leads enable row level security;

create policy "Users can CRUD their own leads" on public.leads
  for all using (auth.uid() = user_id);

-- 2. TASKS TABLE
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) on delete cascade not null,
  type text not null,
  title text not null,
  status text default 'Pending',
  due_date date,
  notes text,
  user_id uuid references auth.users(id) default auth.uid()
);

alter table public.tasks enable row level security;

create policy "Users can CRUD their own tasks" on public.tasks
  for all using (auth.uid() = user_id);

-- 3. ACTIVITIES TABLE
create table public.activities (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) on delete cascade not null,
  type text not null,
  description text not null,
  date date default current_date not null,
  duration text,
  user_id uuid references auth.users(id) default auth.uid()
);

alter table public.activities enable row level security;

create policy "Users can CRUD their own activities" on public.activities
  for all using (auth.uid() = user_id);
```

---

## 2. Environment Configuration

1. In the `/dashboard-src` directory, create a new file named `.env`.
2. Add the credentials you copied from Supabase:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-anon-key
```

*Note: If these environment variables are missing, the CRM automatically switches to **Mock Local Storage Mode**, meaning you can test and use the CRM locally inside your browser's storage without setting up a database.*

---

## 3. Local Development

To make changes to the CRM dashboard interface, run:

```bash
# Navigate to the React source folder
cd dashboard-src

# Install dependencies (if you haven't already)
npm install

# Start the dev server
npm run dev
```

---

## 4. Building & Deploying to Production

When you are ready to publish changes to your website:

1. Compile the build:
   ```bash
   cd dashboard-src
   npm run build
   ```
   *Vite compiles the source files and outputs the compiled JS, CSS, and fonts directly into the root `/Dashboard` directory.*

2. **Commit and Push to Git**:
   Push the changes in both the `dashboard-src/` and `Dashboard/` directories to your repository:
   ```bash
   git add .
   git commit -m "update crm dashboard assets"
   git push
   ```

3. Vercel (or any static hosting platform) will automatically deploy the static files in the `/Dashboard` folder. Visitors opening `yourdomain.com/Dashboard` will load the fully functional React application instantly!
