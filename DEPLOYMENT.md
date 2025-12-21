# Deployment Guide

## Vercel Deployment

The application is ready for deployment to Vercel. Follow these steps:

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 3. Configure Environment Variables

In the Vercel project settings, add these environment variables:

```
DATABASE_URL=your_mongodb_atlas_connection_string
# or MONGODB_URI=your_mongodb_atlas_connection_string (both are supported)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_generated_secret_here
NODE_ENV=production

# Email Configuration (for calendar invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (or use 0.0.0.0/0 for Vercel)
5. Get connection string and add to Vercel environment variables

### 5. Deploy

Vercel will automatically deploy when you push to the main branch.

## Local Testing

Before deploying, test locally:

```bash
# Set environment variables in .env.local
cp .env.example .env.local
# Edit .env.local with your values

# Run build test
npm run build

# Start production server
npm start
```

## Database Seeding

After deployment, seed the database with sample barbers:

### Option 1: Using Web Interface (Easiest - Recommended)

1. Visit the seed page in your browser:
   ```
   https://your-app.vercel.app/seed
   ```

2. Click the "Seed Database" button

The page will show a success message when done, and you can click "View Barbers" to see the seeded data.

### Option 2: Using API Endpoint (Programmatic)

1. Visit your deployed app's seed API endpoint:
   ```
   https://your-app.vercel.app/api/seed
   ```

2. Or use curl:
   ```bash
   curl -X POST https://your-app.vercel.app/api/seed
   ```

3. If you set `SEED_SECRET_TOKEN` environment variable:
   ```bash
   curl -X POST https://your-app.vercel.app/api/seed \
     -H "Authorization: Bearer YOUR_SEED_SECRET_TOKEN"
   ```

The endpoint will:
- Check if barbers already exist
- Only seed if database is empty
- Return status message

### Option 2: Automatic Seeding (via Vercel Build Command)

You can add this to your `vercel.json` or use Vercel's build command to automatically seed after deployment.

**Note:** The seed script is idempotent - it won't duplicate data if barbers already exist.

## Post-Deployment Checklist

- [ ] Seed database with sample barbers (visit `/api/seed` or use curl)
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test barber profile creation
- [ ] Test booking creation
- [ ] Test payment tracking
- [ ] Verify MongoDB connection
- [ ] Check error logs in Vercel dashboard

## Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Check MongoDB connection string format
- Verify NextAuth secret is set

### Runtime Errors
- Check Vercel function logs
- Verify MongoDB Atlas IP whitelist includes Vercel IPs
- Ensure database collections are created

