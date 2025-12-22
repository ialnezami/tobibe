# Doctor Booking App

A modern doctor appointment booking system built with Next.js, MongoDB, and NextAuth.js.

## Features

- 🔐 User authentication (customers and doctors)
- 📅 Booking system with calendar integration
- 📧 Email notifications with Google Calendar invitations
- 📱 Mobile-first responsive design
- 🔍 Doctor discovery and search
- 💳 Payment tracking
- 📊 Booking management dashboard

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Email**: Nodemailer with SMTP
- **Calendar**: ICS file generation

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)
- Email account for SMTP (Gmail recommended for development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd doctor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
# Database
DATABASE_URL=your_mongodb_connection_string
# or
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Email Configuration (for calendar invites)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@doctorbooking.com
```

4. Run the development server:
```bash
npm run dev
```

5. Seed the database (optional):
Visit `http://localhost:3000/seed` in your browser or run:
```bash
npm run seed
```

## Google Calendar Integration

The app automatically sends calendar invitations via email when bookings are created. Both the doctor and customer receive:

1. **Email notification** with booking details
2. **Calendar invitation (.ics file)** attached to the email
3. **One-click add to calendar** - Users can click the attachment to add the appointment to their Google Calendar, Outlook, Apple Calendar, or any other calendar app

### Setting Up Email (Gmail)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASSWORD` in your `.env.local`

3. Configure environment variables:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
EMAIL_FROM=noreply@doctorbooking.com
```

### Calendar Invitation Features

- ✅ Automatically sent to both doctor and customer
- ✅ Includes all booking details (date, time, services, price)
- ✅ Works with Google Calendar, Outlook, Apple Calendar, etc.
- ✅ RSVP functionality
- ✅ Reminder notifications (handled by user's calendar app)

## Project Structure

```
doctor/
├── app/
│   ├── api/           # API routes
│   ├── doctors/       # Doctor pages
│   ├── bookings/      # Booking pages
│   ├── login/         # Authentication pages
│   └── my-bookings/   # Customer booking management
├── components/        # React components
├── lib/
│   ├── db/           # Database connection
│   ├── models/       # Mongoose models
│   ├── utils/        # Utilities (calendar, email, etc.)
│   └── types/        # TypeScript types
└── public/           # Static assets
```

## API Endpoints

### Bookings
- `GET /api/bookings` - Get all bookings (filtered by user role)
- `POST /api/bookings` - Create a new booking (sends calendar invites)
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking status

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/[id]` - Get doctor details
- `GET /api/doctors/[id]/availability` - Get available time slots

### Services
- `GET /api/services` - List services
- `GET /api/services/[id]` - Get service details

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## License

ISC
