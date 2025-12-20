# Barber Booking App

A web application for booking barber appointments with service selection, allowing users to discover barbers on a map or list view, and enabling barbers to manage their availability and services.

## Tech Stack

- **Frontend**: Next.js 16 with React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Deployment**: Vercel (ready)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd barber
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
NODE_ENV=development
```

To generate a NextAuth secret:
```bash
openssl rand -base64 32
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
barber/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── barbers/      # Barber endpoints
│   │   ├── bookings/     # Booking endpoints
│   │   ├── services/     # Service endpoints
│   │   ├── time-slots/   # Time slot endpoints
│   │   └── users/        # User endpoints
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── providers/        # Context providers
├── lib/                   # Utility libraries
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database connection
│   ├── models/           # Mongoose models
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── ...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search?q=query` - Search for customers (barbers only)

### Barbers
- `GET /api/barbers` - Get all barbers (with search/filter)
- `GET /api/barbers/[id]` - Get barber by ID
- `GET /api/barbers/profile` - Get current barber profile
- `PUT /api/barbers/profile` - Update barber profile
- `GET /api/barbers/[id]/availability?date=YYYY-MM-DD` - Get availability

### Services
- `GET /api/services?barberId=id` - Get services for a barber
- `POST /api/services` - Create a service (barbers only)
- `GET /api/services/[id]` - Get service by ID
- `PUT /api/services/[id]` - Update service (barbers only)
- `DELETE /api/services/[id]` - Delete service (barbers only)

### Bookings
- `GET /api/bookings` - Get bookings (filtered by role)
- `POST /api/bookings` - Create a booking
- `GET /api/bookings/[id]` - Get booking by ID
- `PUT /api/bookings/[id]` - Update booking status
- `DELETE /api/bookings/[id]` - Cancel booking

### Time Slots
- `GET /api/time-slots?barberId=id&date=YYYY-MM-DD` - Get time slots
- `POST /api/time-slots` - Block/unblock time slots (barbers only)

## Features

### Customer Features
- ✅ User registration and authentication
- ✅ Browse barbers (list view)
- ✅ View barber profiles and services
- ✅ Book appointments
- ✅ View booking history

### Barber Features
- ✅ Barber registration
- ✅ Profile management
- ✅ Service management (CRUD)
- ✅ Availability management
- ✅ Booking management
- ✅ Book appointments for customers (walk-in/phone)

## Database Models

- **User**: Customer users with basic info
- **Barber**: Extends User with location, description, photos, working hours
- **Service**: Services offered by barbers (name, price, duration)
- **Booking**: Appointments linking customers, barbers, and services
- **TimeSlot**: Time slots with availability and booking status

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

The app is ready to deploy to Vercel:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_URL` - Application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate with `openssl rand -base64 32`)
- `NODE_ENV` - Environment (development/production)

## License

ISC

