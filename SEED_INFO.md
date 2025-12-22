# Database Seeding Information

## Admin User Credentials

After seeding, the following admin user will be created:

- **Email**: `admin@doctorbooking.com`
- **Password**: `admin123`
- **Role**: `admin`

## Doctor Accounts

The seed script creates 5 sample doctors with the following credentials:

1. **Tony's Classic Cuts**
   - Email: `tony@doctor.com`
   - Password: `password123`

2. **Modern Barber Studio**
   - Email: `modern@doctor.com`
   - Password: `password123`

3. **Elite Grooming**
   - Email: `elite@doctor.com`
   - Password: `password123`

4. **Quick Clips Express**
   - Email: `quick@doctor.com`
   - Password: `password123`

5. **Vintage Barber Co.**
   - Email: `vintage@doctor.com`
   - Password: `password123`

## How to Seed

1. Make sure your MongoDB connection is configured in `.env.local`:
   ```
   DATABASE_URL=your_mongodb_connection_string
   # or
   MONGODB_URI=your_mongodb_connection_string
   ```

2. Visit `http://localhost:3000/seed` in your browser

3. Click the "Seed Database" button

4. Wait for the success message

## Testing Login

After seeding, you can login with:
- Admin: `admin@doctorbooking.com` / `admin123`
- Any doctor: Use any of the doctor emails above with password `password123`

