# Z-Gym Helper — Production Deployment Guide (`DEPLOY.md`)

> **Comprehensive, Click-by-Click Deployment Manual for Vercel (Test/Staging) and Netlify (Production)**
> Covers Next.js 16 App Router configuration, Node.js runtime enforcement, Auth.js host trust, PWA HTTPS service worker delivery, MongoDB Atlas setup, Google Cloud OAuth, and automated GitHub Actions cron dispatches.

---

## 📑 Table of Contents
1. [Platform Comparison & Compatibility Notice](#1-platform-comparison--compatibility-notice)
2. [Complete Environment Variables Reference](#2-complete-environment-variables-reference)
3. [Step 1: Production MongoDB Setup (Atlas)](#step-1-production-mongodb-setup-atlas)
4. [Step 2: Google Cloud Console OAuth 2.0 Credentials](#step-2-google-cloud-console-oauth-20-credentials)
5. [Step 3A: Vercel Test / Staging Deployment](#step-3a-vercel-test--staging-deployment)
6. [Step 3B: Netlify Production Deployment](#step-3b-netlify-production-deployment)
7. [Step 4: Automated Reminder Cron via GitHub Actions](#step-4-automated-reminder-cron-via-github-actions)
8. [Step 5: Post-Deployment Verification Checklist](#step-5-post-deployment-verification-checklist)

---

## 1. Platform Comparison & Compatibility Notice

| Dimension | Vercel (Test / Staging) | Netlify (Production Recommendation) |
|---|---|---|
| **Best Used For** | Fast branch previews, test deployments, team PR reviews | Production hosting with active monetization / Google AdSense |
| **Pricing & Ads Policy** | ⚠️ **Hobby tier forbids commercial advertising (Google AdSense)**. Commercial use requires Vercel Pro ($20/seat/mo). | ✅ **Permits commercial AdSense advertising on free tier** within standard bandwidth limits. |
| **Node.js Runtime** | ✅ Runs server routes on standard AWS Lambda via Node.js 20. | ✅ Runs server routes on AWS Lambda via `@netlify/plugin-nextjs`. |
| **Next.js 16 Partial Prerendering (PPR)** | Supported natively on Vercel Fluid compute. | ⚠️ **Potential Incompatibility & Safe Fallback**: AWS Lambda functions buffer chunked responses and can fail on experimental PPR manifests. **Our codebase includes an automatic safe fallback in `next.config.ts`**: when `NETLIFY=true`, PPR and `cacheComponents` are automatically disabled, falling back to 100% stable standard SSG + SSR. |
| **PWA Service Worker** | Served over HTTPS from `public/sw.js`. | Served over HTTPS from `public/sw.js` with root scope headers from `netlify.toml`. |

### 🔍 Deep Dive: Node Runtime, Mongoose & Next.js 16 `cacheComponents`
- **Node.js Only Dependencies**: Packages such as `mongoose` (MongoDB ORM) and `firebase-admin` (Firebase FCM web push) require standard Node.js native APIs (`net`, `tls`, `crypto`, `buffer`) and **will fail on the Edge runtime**.
- **Next.js 16 Turbopack Segment Rule**: In Next.js 16 with `cacheComponents: true`, Next.js operates all routes on the Node.js runtime by default across Node worker threads and **strictly forbids segment-level `export const runtime = 'nodejs'`** (which triggers a compiler build error: `Route segment config 'runtime' is not compatible with nextConfig.cacheComponents`).
- **Resolved**: All routes in Z-Gym Helper execute on standard Node.js serverless functions by default without manual segment exports. On Netlify, `NETLIFY=true` disables `cacheComponents` and compiles standard Node.js Lambda functions.

---

## 2. Complete Environment Variables Reference

Configure these environment variables in your hosting provider's dashboard. **Never commit `.env.local` or upload Firebase service account JSON files to git.**

| Variable Name | Required | Description | Example / Production Value |
|---|:---:|---|---|
| `NEXT_PUBLIC_APP_URL` | **Yes** | Canonical HTTPS base URL of your site (no trailing slash). | `https://zgym.app` or `https://<site>.netlify.app` |
| `DATABASE_URL` or `MONGODB_URI` | **Yes** | MongoDB Atlas production connection string. | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/zgym_prod?retryWrites=true&w=majority` |
| `AUTH_SECRET` | **Yes** | 32+ character random secret used by Auth.js for session cookie encryption. | Generate via: `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | **Yes** | Required for Auth.js behind reverse proxies (Netlify, Vercel previews). | `true` |
| `AUTH_GOOGLE_ID` | **Yes** | Google Cloud Console OAuth 2.0 Client ID. | `*.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | **Yes** | Google Cloud Console OAuth 2.0 Client Secret. | `GOCSPX-...` |
| `ADMIN_EMAILS` | **Yes** | Comma-separated list of administrative emails allowed to access `/admin`. | `admin@zgym.app,tanvir@example.com` |
| `CRON_SECRET` | **Yes** | High-entropy secret token for authenticating hourly push reminders. | Generate via: `openssl rand -hex 24` |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Optional | Base64-encoded string of your Firebase Service Account JSON (for FCM web push). | `cat serviceAccountKey.json \| base64 -w 0` |
| `NEXT_PUBLIC_ADS_ENABLED` | Optional | Controls whether Google AdSense ad slots render (`false` by default). | `false` (or `true` once approved by AdSense) |
| `ADSENSE_PUBLISHER_ID` | Optional | Google AdSense publisher ID for `/ads.txt` generation. | `pub-XXXXXXXXXXXXXXXX` |
| `NEXT_PUBLIC_SHOW_PRODUCTS` | Optional | Keeps e-commerce shop UI hidden for current fitness MVP. | `false` |

---

## Step 1: Production MongoDB Setup (Atlas)

1. **Log in to MongoDB Atlas**: Navigate to [cloud.mongodb.com](https://cloud.mongodb.com) and sign in.
2. **Create or Select a Cluster**: Use the free tier (M0 Sandbox) or dedicated production cluster in the Singapore (`ap-southeast-1`) or Mumbai (`ap-south-1`) region for minimum latency to Bangladesh.
3. **Configure Network Access (Crucial for Serverless)**:
   - Navigate to **Security > Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere (`0.0.0.0/0`)** and confirm.
   - *Reason*: Vercel and Netlify execute route handlers on dynamic serverless lambda IP addresses that change continuously.
4. **Create a Dedicated Database User**:
   - Navigate to **Security > Database Access**.
   - Click **Add New Database User**.
   - Choose **Password Authentication**, set username (e.g., `zgym_app`) and generate a strong password.
   - Under **Database User Privileges**, select **Read and write to any database** (or restrict to `zgym_prod`).
   - Click **Add User**.
5. **Copy Connection String**:
   - Go to **Deployments > Database > Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the URI and replace `<password>` with your user password and database name with `zgym_prod`:
     ```text
     mongodb+srv://zgym_app:YOUR_PASSWORD@cluster0.xxxx.mongodb.net/zgym_prod?retryWrites=true&w=majority
     ```
6. **Seed Initial Food & Exercise Catalogs (Before Deploy)**:
   From your local terminal, test connectivity and seed verified exercises and Bangladeshi foods:
   ```bash
   MONGODB_URI="mongodb+srv://..." npm run db:ping
   MONGODB_URI="mongodb+srv://..." npm run db:seed
   ```

---

## Step 2: Google Cloud Console OAuth 2.0 Credentials

1. **Log in to Google Cloud Console**: Go to [console.cloud.google.com](https://console.cloud.google.com).
2. **Create a Project**: Click the project dropdown at the top > **New Project** > Name it `Z-Gym Helper` > Click **Create**.
3. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services > OAuth consent screen**.
   - Choose **User Type: External** > Click **Create**.
   - **App name**: `Z-Gym Helper`
   - **User support email**: Your support or personal email.
   - **App domain**:
     - Application home page: `https://zgym.app` (or Netlify/Vercel URL)
     - Application privacy policy link: `https://zgym.app/privacy`
     - Application terms of service link: `https://zgym.app/terms`
   - **Developer contact information**: Your email address.
   - Click **Save and Continue**, keep default scopes (`openid`, `email`, `profile`), and publish the app to Production (or add test user emails).
4. **Create OAuth 2.0 Client ID**:
   - Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
   - **Application type**: `Web application`.
   - **Name**: `Z-Gym Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (Local testing)
     - `https://zgym.app` (Production custom domain)
     - `https://<your-project>.vercel.app` (Vercel test domain)
     - `https://<your-site>.netlify.app` (Netlify production domain)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://zgym.app/api/auth/callback/google`
     - `https://<your-project>.vercel.app/api/auth/callback/google`
     - `https://<your-site>.netlify.app/api/auth/callback/google`
5. Click **Create**, then copy your **Client ID** (`AUTH_GOOGLE_ID`) and **Client Secret** (`AUTH_GOOGLE_SECRET`).

---

## Step 3A: Vercel Test / Staging Deployment

Use Vercel for rapid staging validation, pull-request previews, and testing.

1. **Push your code to GitHub**:
   ```bash
   git push origin main
   ```
2. **Import Project into Vercel**:
   - Log into [vercel.com](https://vercel.com).
   - Click **Add New... > Project**.
   - Select your `Z-Gym Helper` GitHub repository and click **Import**.
3. **Configure Build Settings**:
   - Framework Preset: **Next.js** (detected automatically).
   - Root Directory: `./`
   - Build Command: `npm run build` (runs `build:sw` + `next build`).
   - Output Directory: `.next` (default).
4. **Set Environment Variables**:
   Expand the **Environment Variables** section and add:
   - `NEXT_PUBLIC_APP_URL`: `https://<your-project>.vercel.app`
   - `DATABASE_URL`: Your MongoDB Atlas URI.
   - `AUTH_SECRET`: Random 32-char string.
   - `AUTH_TRUST_HOST`: `true`
   - `AUTH_GOOGLE_ID`: From Google Cloud Console.
   - `AUTH_GOOGLE_SECRET`: From Google Cloud Console.
   - `ADMIN_EMAILS`: Your admin email.
   - `CRON_SECRET`: Random secret string.
   - `NEXT_PUBLIC_ADS_ENABLED`: `false`
   - `NEXT_PUBLIC_SHOW_PRODUCTS`: `false`
   - *(Optional)* `FIREBASE_SERVICE_ACCOUNT_BASE64`
5. **Deploy**:
   - Click **Deploy**. Vercel will build the Serwist service worker and compile the App Router.
   - When finished, copy your assigned `https://<project-name>.vercel.app` URL.
   - Return to Google Cloud Console and add this exact URL + `/api/auth/callback/google` to your Authorized Redirect URIs.

---

## Step 3B: Netlify Production Deployment

Netlify is the recommended host for commercial zero-budget deployment with Google AdSense.

1. **Connect Repository to Netlify**:
   - Log into [app.netlify.com](https://app.netlify.com).
   - Click **Add new site > Import an existing project**.
   - Choose **GitHub** and grant access to the `Z-Gym Helper` repository.
2. **Verify Build Configuration**:
   Netlify automatically reads our [`netlify.toml`](./netlify.toml):
   - **Base directory**: (leave blank)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Plugin**: `@netlify/plugin-nextjs` is applied automatically.
3. **Configure Environment Variables**:
   In **Site configuration > Environment variables**, click **Add a variable** (or **Import from .env**) and paste:
   ```env
   NEXT_PUBLIC_APP_URL=https://zgym.app
   DATABASE_URL=mongodb+srv://...
   AUTH_SECRET=your_32_char_random_secret
   AUTH_TRUST_HOST=true
   AUTH_GOOGLE_ID=your_google_client_id.apps.googleusercontent.com
   AUTH_GOOGLE_SECRET=your_google_client_secret
   ADMIN_EMAILS=admin@zgym.app
   CRON_SECRET=your_cron_secret
   NEXT_PUBLIC_ADS_ENABLED=false
   NEXT_PUBLIC_SHOW_PRODUCTS=false
   ```
4. **Deploy Site**:
   - Click **Deploy site**.
   - Netlify sets `NETLIFY=true` in build environments, which triggers our `next.config.ts` fallback (cleanly disabling experimental PPR and compiling standard App Router lambdas).
5. **Assign Custom Domain & SSL**:
   - In **Domain management**, add your production domain (`zgym.app`).
   - Configure DNS (A record `@` to Netlify's load balancer IP `75.2.60.5` or CNAME `www` to `<site>.netlify.app`).
   - Netlify automatically provisions a free Let's Encrypt SSL certificate within a few minutes.
6. **Update Google OAuth Redirect URI**:
   - Add `https://zgym.app/api/auth/callback/google` to Google Cloud Console.

---

## Step 4: Automated Reminder Cron via GitHub Actions

Z-Gym Helper sends user-configured meal and workout push notifications in their local timezone (`Asia/Dhaka`). Since we do not depend on proprietary Vercel Cron, reminders are driven by GitHub Actions.

1. In your GitHub repository, navigate to **Settings > Secrets and variables > Actions**.
2. Click **New repository secret** and add:
   - **Name**: `APP_URL`
   - **Secret**: `https://zgym.app` (or your Netlify / Vercel deployment URL).
3. Click **New repository secret** again:
   - **Name**: `CRON_SECRET`
   - **Secret**: The exact `CRON_SECRET` string you configured in Vercel/Netlify.
4. Verify the workflow file at [`.github/workflows/cron-reminders.yml`](./.github/workflows/cron-reminders.yml):
   - Runs automatically every hour (`0 * * * *`).
   - Dispatches a secure POST to `${{ secrets.APP_URL }}/api/cron/reminders` with `Authorization: Bearer ${{ secrets.CRON_SECRET }}`.
5. **Test the Cron Job**:
   - Go to the **Actions** tab in GitHub.
   - Click **Hourly Workout & Meal Push Reminders** in the left sidebar.
   - Click **Run workflow > Run workflow**.
   - Verify green checkmark and response `{ "success": true, "processedUsers": ... }`.

---

## Step 5: Post-Deployment Verification Checklist

Execute this verification sequence on your live deployment URL:

- [ ] **1. HTTPS & Security Headers**:
  - Visit `https://<your-domain>/` in an incognito window.
  - Verify SSL padlock is active.
- [ ] **2. Public Tools & Guest Mode**:
  - Open `/calculator`: adjust Mifflin-St Jeor height/weight sliders, verify targets recalculate instantly.
  - Open `/foods`: search for Bengali staple `ভাত` and English `chicken`, verify instant fuzzy results.
  - Open `/bmi`: check South Asian metabolic risk classifications.
  - Open `/exercises`: verify exercise list and thumbnail images load cleanly.
- [ ] **3. PWA Service Worker & Manifest**:
  - Open Chrome DevTools > **Application > Service Workers**: verify `/sw.js` is active with scope `https://<your-domain>/`.
  - Open Chrome DevTools > **Application > Manifest**: verify App Name (`Z-Gym Helper`), Short Name (`Z-Gym`), and icons render without errors.
- [ ] **4. Google Sign-In & Guest Data Merge**:
  - In Guest Mode, log a meal in `/calculator`.
  - Click **Sign In with Google** (`/login`).
  - Authorize your Google account.
  - Verify seamless redirect to `/dashboard`.
  - Verify that the guest meal logged previously merged into your authenticated account without duplicate items.
  - Verify that your display name shows an anonymous athlete nickname (e.g. `Athlete-XXXX`), never exposing your Google name or email.
- [ ] **5. Access Control & Security Guards**:
  - Visit `/admin` with a non-admin Google account: verify `403 Forbidden` guard.
  - Send POST request to `/api/seed`: verify `403 Forbidden: Database seeding via HTTP API is permanently disabled in production`.
- [ ] **6. Legal Pages & Ads Slot**:
  - Visit `/privacy`: verify complete 8-section policy.
  - Visit `/terms`, `/about`, and `/contact`.
  - Visit `/ads.txt`: verify Google AdSense publisher configuration or comments render cleanly.
- [ ] **7. Account Deletion (Cascade Wipe)**:
  - In `/settings`, test the **Delete My Account** button on a test user.
  - Verify immediate cascade deletion from MongoDB (user, meals, workouts, weight records, push tokens, and challenge memberships).
