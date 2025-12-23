# Vercel Environment Variables Setup Guide

## 🔴 Server Error Fix

If you're seeing "Server error - There is a problem with the server configuration", it means required environment variables are missing in Vercel.

## Required Environment Variables

### 1. **Critical (Required for App to Work)**

#### `NEXTAUTH_SECRET` ⚠️ **MOST IMPORTANT**
- **Purpose**: Secret key for NextAuth.js session encryption
- **How to generate**:
  ```bash
  openssl rand -base64 32
  ```
  Or use an online generator: https://generate-secret.vercel.app/32
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6=`

#### `NEXTAUTH_URL`
- **Purpose**: The canonical URL of your site
- **For Vercel**: `https://tobibe.vercel.app`
- **For custom domain**: `https://yourdomain.com`

#### `DATABASE_URL` or `MONGODB_URI`
- **Purpose**: MongoDB connection string
- **Format**: `mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/<YOUR_DATABASE>?retryWrites=true&w=majority`
- **Where to get**: MongoDB Atlas → Connect → Connect your application
- **⚠️ Important**: Replace `<YOUR_USERNAME>`, `<YOUR_PASSWORD>`, `<YOUR_CLUSTER>`, and `<YOUR_DATABASE>` with your actual values

### 2. **Optional (For Email Features)**

#### Email Configuration (for calendar invitations)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@doctorbooking.com
```

## Step-by-Step Setup in Vercel

### Step 1: Go to Vercel Project Settings

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`tobibe`)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Click **"Add New"** and add each variable:

#### 1. NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: Generate using `openssl rand -base64 32`
- **Environment**: Production, Preview, Development (select all)

#### 2. NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://tobibe.vercel.app`
- **Environment**: Production, Preview, Development (select all)

#### 3. DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: Your MongoDB Atlas connection string
- **Environment**: Production, Preview, Development (select all)

**Example MongoDB Atlas Connection String Format:**
```
mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@cluster0.xxxxx.mongodb.net/<YOUR_DATABASE>?retryWrites=true&w=majority
```

**⚠️ Replace placeholders:**
- `<YOUR_USERNAME>` - Your MongoDB Atlas database username
- `<YOUR_PASSWORD>` - Your MongoDB Atlas database password (URL-encode special characters)
- `cluster0.xxxxx` - Your actual cluster address from MongoDB Atlas
- `<YOUR_DATABASE>` - Your database name (e.g., `tobibe`)

### Step 3: MongoDB Atlas Setup

1. **Create/Login to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Create a Cluster** (Free tier is fine)
3. **Create Database User**:
   - Go to **Security** → **Database Access**
   - Click **"Add New Database User"**
   - Choose **"Password"** authentication
   - Save the username and password
4. **Whitelist IP Addresses**:
   - Go to **Security** → **Network Access**
   - Click **"Add IP Address"**
   - For Vercel, add: `0.0.0.0/0` (allows all IPs)
   - ⚠️ **Note**: For production, consider restricting IPs
5. **Get Connection String**:
   - Go to **Database** → **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `tobibe`)

### Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic redeploy

### Step 5: Verify

1. Visit your site: https://tobibe.vercel.app
2. Try to register a new account
3. Try to log in
4. Check Vercel logs if errors persist

## Quick Test Commands

### Generate NEXTAUTH_SECRET (Mac/Linux)
```bash
openssl rand -base64 32
```

### Generate NEXTAUTH_SECRET (Windows PowerShell)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Test MongoDB Connection Locally
```bash
# Add to .env.local
DATABASE_URL=your_connection_string

# Test connection
npm run dev
# Visit http://localhost:3000/seed
```

## Troubleshooting

### Error: "NEXTAUTH_SECRET is missing"
- **Fix**: Add `NEXTAUTH_SECRET` to Vercel environment variables
- **Generate**: Use `openssl rand -base64 32`

### Error: "Database connection failed"
- **Fix**: Check `DATABASE_URL` is correct
- **Check**: MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- **Verify**: Database user credentials are correct

### Error: "Invalid credentials"
- **Fix**: Make sure password in connection string is URL-encoded
- **Special characters**: `@` becomes `%40`, `#` becomes `%23`, etc.

### Error: "IP not whitelisted"
- **Fix**: Add `0.0.0.0/0` to MongoDB Atlas Network Access
- **Wait**: Changes can take 1-2 minutes to propagate

## Environment Variables Checklist

- [ ] `NEXTAUTH_SECRET` - Generated and added
- [ ] `NEXTAUTH_URL` - Set to `https://tobibe.vercel.app`
- [ ] `DATABASE_URL` - MongoDB Atlas connection string
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] Database user created in MongoDB Atlas
- [ ] Redeployed after adding variables

## After Setup

Once environment variables are set:

1. **Seed the database**: Visit `https://tobibe.vercel.app/seed`
2. **Test registration**: Create a new account
3. **Test login**: Log in with created account
4. **Test features**: Access patient/doctor/admin dashboards

## Security Notes

- ⚠️ Never commit `.env.local` to git
- ⚠️ `NEXTAUTH_SECRET` should be unique and random
- ⚠️ MongoDB password should be strong
- ⚠️ For production, consider restricting MongoDB IP whitelist
- ⚠️ Use environment-specific variables in Vercel

