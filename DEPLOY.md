# Travcano - Deployment Guide

## Step 1: Supabase Setup

### 1.1 Create Project
1. Go to https://supabase.com → Sign up / Log in
2. Click **"New Project"**
3. Choose organization → Enter project name: `travcano`
4. Enter a strong database password (save it!)
5. Choose region closest to your users
6. Click **"Create new project"**

### 1.2 Get API Keys
1. In your project dashboard → Go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** → looks like: `https://xxxxxxxx.supabase.co`
   - **Anon (public) key** → starts with: `eyJhbGciOiJIUzI1NiIs...`

### 1.3 Run Database Schema
1. Go to **SQL Editor** in the dashboard
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this project
4. Copy ALL the content and paste it in the SQL Editor
5. Click **"Run"** → Wait for success message

### 1.4 Run RLS Policies
1. Click **"New query"** again
2. Open `supabase/rls_policies.sql`
3. Copy ALL content → Paste → Click **"Run"**

### 1.5 Run Seed Data
1. Click **"New query"** again
2. Open `supabase/seed.sql`
3. Copy ALL content → Paste → Click **"Run"**

### 1.6 Create Storage Bucket
1. Go to **Storage** in the dashboard
2. Click **"New bucket"**
3. Name: `images`
4. Make it **Public** (toggle ON)
5. Click **"Create bucket"**

### 1.7 Set Storage Policies
1. Click on the `images` bucket → Go to **Policies** tab
2. Click **"New policy"** → Choose **"Full customization"**
3. Policy name: `Public Access`
4. Allowed operations: SELECT, INSERT, UPDATE, DELETE
5. Target roles: `authenticated`, `anon`
6. Using expression: `true`
7. Click **"Save policy"**

### 1.8 Configure Auth Settings
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Optional: Enable Google, Facebook etc. for social login
4. Go to **Authentication** → **URL Configuration**
5. Set **Site URL** to your Vercel domain: `https://your-app.vercel.app`
6. Add **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Step 2: Update .env File

Update the `.env` file in the project root with your Supabase keys:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=Travcano
```

Test locally first:
```bash
npm install
npm run dev
```

---

## Step 3: Deploy to Vercel

### 3.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Travcano"
git remote add origin https://github.com/your-username/travcano.git
git push -u origin main
```

### 3.2 Deploy on Vercel
1. Go to https://vercel.com → Log in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find your `travcano` repository → Click **"Import"**
4. Framework: **Vite** (auto-detected)
5. Build Command: `npm run build` (auto-detected)
6. Output Directory: `dist` (auto-detected)
7. **Environment Variables** → Add:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
   - `VITE_APP_NAME` → `Travcano`
8. Click **"Deploy"**
9. Wait ~1-2 minutes for first deployment

### 3.3 Custom Domain (Optional)
1. In your Vercel project → **Settings** → **Domains**
2. Enter your domain name
3. Follow DNS instructions from Vercel

---

## Step 4: Make Yourself Admin

After deployment, you need to make your user an admin:

1. Register an account on your deployed site
2. Go to Supabase Dashboard → **SQL Editor**
3. Run this query (replace `your-email@example.com` with your email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

4. Log out and log back in
5. You should now see **"Admin Dashboard"** in the navbar

---

## Step 5: Add Initial Content

### Via Admin Dashboard
1. Go to `/admin/login` → Sign in
2. Add **Destinations** (with images)
3. Add **Trips** (with prices, images, link to destinations)
4. Add **Services** (with icons)
5. Add **Gallery** images
6. Write **Blog** posts
7. Add **FAQ** questions
8. Upload **Logo** and **Favicon** in Settings

---

## Troubleshooting

### Build fails on Vercel
- Check that `.env` variables are set in Vercel dashboard
- Make sure `VITE_SUPABASE_URL` ends with `.supabase.co`

### Images not uploading
- Check that the `images` bucket exists in Supabase Storage
- Check that the bucket is set to **Public**
- Check that storage policies are set correctly

### Can't access admin
- Make sure you ran the SQL query to set your role to `admin`
- Make sure you're logged out and logged back in after the update

### Blank page after deploy
- Check that Vercel rewrites are set in `vercel.json`
- The SPA needs all routes to redirect to `index.html`

---

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_APP_NAME` | Application name | `Travcano` |
