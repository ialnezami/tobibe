# MongoDB Atlas Connection Troubleshooting Guide

## Error: IP Address Not Whitelisted

If you're seeing this error:
```
Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Quick Fix Steps

### Step 1: Get Your Current IP Address

Your current IP address is: **Check the output of the command below**

Run this command to get your IP:
```bash
curl -s https://api.ipify.org
```

Or visit: https://www.whatismyip.com/

### Step 2: Whitelist Your IP in MongoDB Atlas

1. **Log in to MongoDB Atlas**
   - Go to https://cloud.mongodb.com/
   - Sign in to your account

2. **Navigate to Network Access**
   - Click on your project/cluster
   - Go to **Security** → **Network Access** (or **IP Access List**)

3. **Add Your IP Address**
   - Click **"Add IP Address"** or **"Add Entry"**
   - Choose one of these options:
     - **Option A (Recommended for Development)**: Click **"Add Current IP Address"** button
     - **Option B**: Enter your IP manually (from Step 1)
     - **Option C (For Testing Only)**: Add `0.0.0.0/0` to allow all IPs (⚠️ **NOT recommended for production**)

4. **Save the Changes**
   - Click **"Confirm"** or **"Add"**
   - Wait 1-2 minutes for changes to propagate

### Step 3: Verify Your Connection String

Make sure your `.env.local` file has the correct connection string:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

Or:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

**Important Notes:**
- Replace `username` with your MongoDB Atlas username
- Replace `password` with your MongoDB Atlas password (URL-encoded if it contains special characters)
- Replace `cluster` with your actual cluster name
- Replace `database-name` with your database name

### Step 4: Test the Connection

1. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

2. **Try seeding again:**
   - Visit `http://localhost:3000/seed`
   - Click "Seed Database"

## Alternative Solutions

### Solution 1: Use MongoDB Atlas M0 (Free Tier)

If you don't have a MongoDB Atlas account:

1. Sign up at https://www.mongodb.com/cloud/atlas/register
2. Create a free M0 cluster (no credit card required)
3. Create a database user
4. Get your connection string
5. Whitelist your IP (as described above)

### Solution 2: Use Local MongoDB

If you prefer to use a local MongoDB instance:

1. **Install MongoDB locally:**
   ```bash
   # macOS (using Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB
   brew services start mongodb-community
   ```

2. **Update your `.env.local`:**
   ```env
   DATABASE_URL=mongodb://localhost:27017/doctor-booking
   ```

### Solution 3: Allow All IPs (Development Only)

⚠️ **WARNING: Only use this for local development, NEVER in production!**

1. In MongoDB Atlas Network Access, add: `0.0.0.0/0`
2. This allows connections from any IP address
3. Remove this after testing

## Common Issues

### Issue: IP Changed (Dynamic IP)

If your IP address changes frequently (common with home internet):

1. Check your current IP: `curl -s https://api.ipify.org`
2. Update the whitelist in MongoDB Atlas
3. Or use a static IP/VPN

### Issue: Connection String Format

Make sure your connection string:
- Starts with `mongodb+srv://` (for Atlas) or `mongodb://` (for local)
- Has proper URL encoding for special characters in password
- Includes the database name

### Issue: Firewall/Network Restrictions

If you're on a corporate network:
- Check if your firewall blocks MongoDB connections
- Contact your IT department
- Consider using a VPN

## Testing Connection

You can test your MongoDB connection with this simple script:

```bash
# Create a test file
cat > test-connection.js << 'EOF'
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  });
EOF

# Run the test
node test-connection.js
```

## Still Having Issues?

1. **Check MongoDB Atlas Status**: https://status.mongodb.com/
2. **Review MongoDB Atlas Logs**: Check the "Logs" section in your Atlas dashboard
3. **Verify Database User**: Make sure your database user has proper permissions
4. **Check Connection String**: Ensure it's copied correctly from Atlas

## Need Help?

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB Community Forums: https://developer.mongodb.com/community/forums/

