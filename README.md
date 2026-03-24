# GolfStake ⛳

A premium, subscription-driven web application combining golf performance tracking, monthly prize draws, and charitable giving. Built as a technical demonstration for real-world scaling, dynamic algorithm computation, and multi-tier authentication.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19, Vanilla CSS Modules (Custom Design System)
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email + Google OAuth PKCE Flow)
- **Deployment:** Vercel

## ✨ Core Features

1. **Robust Subscription Engine:** Simulated SaaS lifecycle logic with plan selection (Monthly/Yearly) and active subscription validation guards on dashboard routing.
2. **Algorithmic Draw Engine:** Admin-controlled lottery simulator capable of generating Pure Random or Frequency-Weighted winning numbers based on global user score histories. 
3. **Dynamic Prize Calculations:** Automated 40/35/25% prize pool distribution with 5-match jackpot rollover tracking.
4. **Stableford Score Tracker:** Rolling retention system automatically drops players' oldest scores and uses their 5 most recent rounds as their lottery ticket.
5. **Charity Routing:** Users can assign a minimum of 10% (up to 50%) of their subscription fee to a dynamically routed charity from the live directory.

## 🛠️ Local Development

### 1. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Database Setup
Run the SQL migration scripts located in `supabase/migrations/` in your Supabase SQL Editor in exact numerical order to build the 9-table schema and configure Row-Level Security (RLS) policies.

### 3. Start the Server
```bash
npm install
npm run dev
```

## 🔒 Security Architecture
- Implemented **Row-Level Security (RLS)** in PostgreSQL to ensure standard users can only perform `SELECT`, `UPDATE`, and `INSERT` on their own UUID-bound data rows.
- Created an Admin promotion system utilizing `SECURITY DEFINER` functions to prevent infinite recursion during permission bypass checks.
- Handled empty state edge cases across the platform utilizing `.maybeSingle()` to prevent 406 Not Acceptable crashes.
