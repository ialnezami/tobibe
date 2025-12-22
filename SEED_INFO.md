# Database Seeding Information

## Admin User Credentials

After seeding, the following admin user will be created:

- **Email**: `admin@doctorbooking.com`
- **Password**: `admin123`
- **Role**: `admin`

## Doctor Accounts

The seed script creates 5 sample doctors with the following credentials:

1. **Tony's Classic Cuts**
   - Email: `tony@barbershop.com`
   - Password: `password123`

2. **Modern Barber Studio**
   - Email: `modern@barbershop.com`
   - Password: `password123`

3. **Elite Grooming**
   - Email: `elite@barbershop.com`
   - Password: `password123`

4. **Quick Clips Express**
   - Email: `quick@barbershop.com`
   - Password: `password123`

5. **Vintage Barber Co.**
   - Email: `vintage@barbershop.com`
   - Password: `password123`

**Note**: These emails still reference "barbershop" from the original template. You may want to update them to use "doctor" domain in the seed script if desired.

## How to Seed

1. **Configure MongoDB Connection** in `.env.local`:
   ```
   DATABASE_URL=your_mongodb_connection_string
   # or
   MONGODB_URI=your_mongodb_connection_string
   ```

2. **Whitelist Your IP Address** in MongoDB Atlas:
   - Your current IP: `149.102.242.92`
   - Go to MongoDB Atlas → Security → Network Access
   - Click "Add IP Address" → "Add Current IP Address"
   - Wait 1-2 minutes for changes to take effect
   - See `MONGODB_TROUBLESHOOTING.md` for detailed instructions

3. Visit `http://localhost:3000/seed` in your browser

4. Click the "Seed Database" button

5. Wait for the success message

## Testing Login

After seeding, you can login with:
- Admin: `admin@doctorbooking.com` / `admin123`
- Any doctor: Use any of the doctor emails above with password `password123`

