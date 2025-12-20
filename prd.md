# Barber Booking App - Product Requirements Document

## Overview
A web application for booking barber appointments with service selection, allowing users to discover barbers on a map or list view, and enabling barbers to manage their availability and services.

## Technology Stack
- **Frontend Framework**: Next.js (React)
- **Database**: MongoDB
- **Deployment**: Vercel
- **Styling**: (To be determined - Tailwind CSS recommended)

## Core Features

### User Features

#### 1. Barber Discovery
- **Map View**: Interactive map showing all available barbers with their locations
- **List View**: List of barbers with key information (name, location, rating, availability)
- Users can switch between map and list views
- Search and filter functionality (by location, rating, services)

#### 2. Appointment Booking
- View barber's available time slots
- Select desired time slot
- Choose services from available options
- Service time breakdown:
  - Haircut: 10 minutes
  - Beard trim: 10 minutes
  - Face masks/treatments: 10 minutes
  - Total booking time: 30 minutes (can combine multiple services)
- Confirmation system with booking details
- Booking history and management

#### 3. User Account
- User registration and authentication
- Profile management
- Booking history and upcoming appointments
- Ability to cancel or reschedule appointments

### Barber Features

#### 1. Barber Profile Management
- Create and edit barber profile
- Set location (for map display)
- Upload photos and description
- Set working hours

#### 2. Service Management
- Define available services
- Set pricing for each service
- Configure service duration (default: 10 minutes per service)
- Enable/disable services

#### 3. Availability Management
- Set default working hours
- Block specific time slots (unavailable times)
- Set custom availability schedules
- Manage time slot duration (default: 30-minute slots)

#### 4. Booking Management
- View all bookings
- Confirm/cancel bookings
- See booking history
- Manage appointment status
- **Book appointments on behalf of customers** (for walk-ins, phone calls, or SMS requests)
  - Search for existing customers by name, phone, or email
  - Create new customer profile if customer doesn't exist
  - Select time slot and services for the customer
  - Complete booking with customer contact information

## Technical Requirements

### Database Schema (MongoDB)
- Users collection (customers)
- Barbers collection
- Services collection
- Bookings collection
- Time slots collection

### Key Functionalities
- Real-time availability checking
- Time slot conflict prevention
- Service combination logic
- Map integration (Google Maps or Mapbox)
- Responsive design for mobile and desktop

## User Flows

### Customer Flow
1. Browse barbers (map/list view)
2. Select a barber
3. View available time slots
4. Select services
5. Confirm booking
6. Receive confirmation

### Barber Flow
1. Register as barber
2. Set up profile and location
3. Configure services and pricing
4. Set availability schedule
5. Block unavailable slots
6. Manage incoming bookings

### Barber-Assisted Booking Flow (Walk-in/Phone/SMS)
1. Barber receives booking request (phone call, SMS, or walk-in)
2. Search for existing customer or create new customer profile
3. Select available time slot
4. Choose services for the customer
5. Complete booking and confirm with customer
6. Customer receives booking confirmation (if contact info provided)

## Success Metrics
- Number of registered users and barbers
- Booking completion rate
- User satisfaction (ratings/reviews - future feature)
- Time slot utilization rate

## Future Enhancements (Out of Scope for MVP)
- Reviews and ratings system
- Payment integration
- In-app messaging
- Reminder notifications
- Loyalty programs
- Multi-language support 