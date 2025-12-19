# Database Setup Guide

## Quick Setup with Neon (Free Tier)

1. **Sign up at**: https://console.neon.tech/signup
   - Use GitHub for instant signup
   - Select free tier (no credit card required)

2. **Create a new project**:
   - Project name: `quantum-suites-ai`
   - Region: Choose closest to your users
   - PostgreSQL version: Latest (16)

3. **Get your connection string**:
   - After project creation, copy the connection string
   - It looks like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

4. **Add to Vercel**:
   ```bash
   echo "YOUR_DATABASE_URL" | vercel env add DATABASE_URL production
   ```

5. **Add to local .env.local**:
   ```
   DATABASE_URL="YOUR_DATABASE_URL"
   ```

6. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

## Switching Databases Later

To switch databases without breaking anything:

1. **Update the DATABASE_URL** environment variable only
2. **Run migrations** on the new database:
   ```bash
   npx prisma migrate deploy
   ```
3. No code changes needed - Prisma handles the connection

## Alternative Database Providers

- **Supabase**: https://supabase.com (includes Auth + Database)
- **Railway**: https://railway.app (simple deployment)
- **PlanetScale**: https://planetscale.com (MySQL alternative)
- **AWS RDS**: For production-grade setups

All use the same DATABASE_URL pattern!
