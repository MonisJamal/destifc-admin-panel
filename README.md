# DestiFC - Apple Liquid Glass Admin Portal (Vercel Edition)

A high-performance Next.js Admin Portal with authentic Apple Liquid Glass UI connecting directly to Supabase PostgreSQL.

## Features
- **Team Passcode Authentication**: Protects the admin panel with customizable passcode.
- **System Overview Dashboard**: Real-time cloud statistics (Users, Cards, Market Listings, Custom Releases).
- **Custom Card Studio**: Create and mint custom cards with stats & images straight into Discord drafts.
- **Cloud Database Explorer**: Filter and inspect users, card inventory, and active market listings.
- **3D Formation Visualizer**: Drag-and-drop tactical player nodes to adjust 3D pitch perspective in real-time.

## 🚀 How to Deploy on Vercel (1-Minute Guide)

1. **Import Project to GitHub**:
   - Unzip this folder and push it to a new GitHub repository (or use Vercel CLI `npx vercel`).

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **Add New... -> Project**.
   - Select your GitHub repository.
   - Under **Environment Variables**, add:
     - `DATABASE_URL`: `postgresql://postgres.xreebpmibnbttuhevall:MonislovesBiryani37@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`
     - `ADMIN_PASSWORD`: `admin` (or your chosen secret password)
   - Click **Deploy**!

Your admin portal is now live with 24/7 uptime!
