# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Supabase setup
1. Create a Supabase project and copy the Project URL and anon key.
2. Add these to `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Create the `learning_snapshots` table in Supabase:

```sql
create table if not exists public.learning_snapshots (
  user_id uuid primary key references auth.users on delete cascade,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.learning_snapshots enable row level security;

create policy "Users can read their snapshot"
  on public.learning_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert their snapshot"
  on public.learning_snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users can update their snapshot"
  on public.learning_snapshots for update
  using (auth.uid() = user_id);
```

### Supabase data tables
```sql
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users on delete cascade,
  openai_api_key text,
  theme text,
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_states (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_states (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_states (
  user_id uuid primary key references auth.users on delete cascade,
  is_premium boolean not null default false,
  last_payment_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_past_papers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  subject text not null,
  year integer not null,
  paper_type text not null,
  title text not null,
  has_answers boolean not null default false,
  pdf_url text not null,
  source text not null,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.learning_states enable row level security;
alter table public.workspace_states enable row level security;
alter table public.billing_states enable row level security;
alter table public.user_past_papers enable row level security;

create policy "Profiles: user read" on public.user_profiles for select using (auth.uid() = user_id);
create policy "Profiles: user upsert" on public.user_profiles for insert with check (auth.uid() = user_id);
create policy "Profiles: user update" on public.user_profiles for update using (auth.uid() = user_id);
create policy "Profiles: user delete" on public.user_profiles for delete using (auth.uid() = user_id);

create policy "Settings: user read" on public.user_settings for select using (auth.uid() = user_id);
create policy "Settings: user upsert" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "Settings: user update" on public.user_settings for update using (auth.uid() = user_id);

create policy "Learning: user read" on public.learning_states for select using (auth.uid() = user_id);
create policy "Learning: user upsert" on public.learning_states for insert with check (auth.uid() = user_id);
create policy "Learning: user update" on public.learning_states for update using (auth.uid() = user_id);

create policy "Workspace: user read" on public.workspace_states for select using (auth.uid() = user_id);
create policy "Workspace: user upsert" on public.workspace_states for insert with check (auth.uid() = user_id);
create policy "Workspace: user update" on public.workspace_states for update using (auth.uid() = user_id);

create policy "Billing: user read" on public.billing_states for select using (auth.uid() = user_id);
create policy "Billing: user upsert" on public.billing_states for insert with check (auth.uid() = user_id);
create policy "Billing: user update" on public.billing_states for update using (auth.uid() = user_id);

create policy "Past papers: user read" on public.user_past_papers for select using (auth.uid() = user_id);
create policy "Past papers: user insert" on public.user_past_papers for insert with check (auth.uid() = user_id);
create policy "Past papers: user delete" on public.user_past_papers for delete using (auth.uid() = user_id);
```

For local development, you can disable email confirmation in Supabase auth settings to simplify sign-up.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
