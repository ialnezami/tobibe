# Patient-Only Features Proposal

## Overview
This document outlines proposed patient-only features for the Doctor Booking App. Patients (customers) should have a comprehensive dashboard to manage their health appointments, medical records, and interactions with doctors.

## Current Patient Status
- ✅ Patient role exists (as "customer")
- ✅ Patients can book appointments
- ✅ Patients can view their bookings
- ❌ No dedicated patient dashboard
- ❌ No medical history tracking
- ❌ No prescription management
- ❌ No health reminders

---

## Proposed Patient Features

### 1. **Patient Dashboard** (`/patient/dashboard`)
A personalized overview page showing:
- **Upcoming Appointments:**
  - Next appointment details
  - Countdown to next appointment
  - Quick reschedule/cancel options
- **Recent Activity:**
  - Last appointment
  - Recent prescriptions
  - Health reminders
- **Quick Stats:**
  - Total appointments
  - Favorite doctors
  - Health records count
- **Quick Actions:**
  - Book new appointment
  - View medical records
  - Request prescription refill
  - Contact doctor

### 2. **Medical Records** (`/patient/records`)
- **Appointment History:**
  - Complete history of all appointments
  - Filter by doctor, date, service
  - View appointment notes (if doctor adds them)
- **Prescriptions:**
  - List of all prescriptions
  - Prescription details (medication, dosage, instructions)
  - Refill status and requests
  - Expiration dates
- **Medical Documents:**
  - Upload and store medical documents
  - Lab results
  - Test reports
  - Insurance documents
- **Health Metrics:**
  - Track vital signs (blood pressure, weight, etc.)
  - Health trends over time
  - Charts and graphs

### 3. **Favorite Doctors** (`/patient/favorites`)
- **Saved Doctors:**
  - List of favorite doctors
  - Quick booking from favorites
  - Doctor contact information
- **Doctor Notes:**
  - Personal notes about each doctor
  - Preferred appointment times
- **Quick Access:**
  - One-click booking with favorites

### 4. **Health Reminders** (`/patient/reminders`)
- **Appointment Reminders:**
  - Upcoming appointment notifications
  - Email/SMS reminders (24h, 1h before)
- **Medication Reminders:**
  - Prescription refill reminders
  - Daily medication reminders
- **Health Check Reminders:**
  - Annual checkup reminders
  - Vaccination reminders
  - Custom health goals

### 5. **Prescription Management** (`/patient/prescriptions`)
- **Active Prescriptions:**
  - Current medications
  - Dosage instructions
  - Refill dates
- **Prescription History:**
  - All past prescriptions
  - Prescribed by which doctor
  - Dates and duration
- **Refill Requests:**
  - Request prescription refills
  - Track refill status
  - Automatic refill requests

### 6. **Appointment Management** (`/patient/appointments`)
- **Enhanced Booking:**
  - View detailed appointment history
  - Appointment notes and follow-ups
  - Download appointment summaries
- **Rescheduling:**
  - Easy reschedule interface
  - View available slots
  - Automatic notifications
- **Cancellation:**
  - Cancel with reason
  - Cancellation history
  - Refund tracking

### 7. **Health Profile** (`/patient/profile`)
- **Personal Information:**
  - Medical history
  - Allergies
  - Current medications
  - Emergency contacts
- **Insurance Information:**
  - Insurance provider
  - Policy number
  - Coverage details
- **Health Preferences:**
  - Preferred communication method
  - Language preferences
  - Accessibility needs

### 8. **Messages/Communication** (`/patient/messages`)
- **Doctor Messages:**
  - Secure messaging with doctors
  - Appointment-related communications
  - Prescription questions
- **Notifications:**
  - Appointment confirmations
  - Prescription ready notifications
  - Health reminders
- **Announcements:**
  - System-wide announcements
  - Doctor availability updates

---

## Implementation Priority

### Phase 1 (High Priority - Core Patient Features)
1. ✅ Patient Dashboard
2. ✅ Enhanced Appointment Management
3. ✅ Favorite Doctors
4. ✅ Medical Records (basic)

### Phase 2 (Medium Priority - Enhanced Features)
5. ✅ Prescription Management
6. ✅ Health Reminders
7. ✅ Health Profile

### Phase 3 (Low Priority - Advanced Features)
8. ✅ Messages/Communication
9. ✅ Health Metrics Tracking
10. ✅ Document Storage

---

## Technical Requirements

### 1. Patient Middleware
```typescript
// lib/auth/middleware.ts
export async function requirePatient(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  if (session.user.role !== "customer") {
    return NextResponse.json(
      { error: "Forbidden: Patient access required" },
      { status: 403 }
    );
  }
  
  return null;
}
```

### 2. Patient API Routes
- `/api/patient/dashboard` - Dashboard statistics
- `/api/patient/favorites` - Favorite doctors
- `/api/patient/records` - Medical records
- `/api/patient/prescriptions` - Prescription management
- `/api/patient/reminders` - Health reminders

### 3. Patient Pages Structure
```
app/patient/
  ├── dashboard/
  │   └── page.tsx
  ├── appointments/
  │   ├── page.tsx
  │   └── [id]/
  │       └── page.tsx
  ├── favorites/
  │   └── page.tsx
  ├── records/
  │   └── page.tsx
  ├── prescriptions/
  │   └── page.tsx
  ├── reminders/
  │   └── page.tsx
  ├── profile/
  │   └── page.tsx
  └── layout.tsx (patient layout)
```

### 4. Database Models (New)
- **FavoriteDoctor** - Patient's favorite doctors
- **Prescription** - Prescription records
- **HealthRecord** - Medical records
- **Reminder** - Health reminders
- **MedicalDocument** - Uploaded documents

---

## UI/UX Considerations

1. **Design Consistency:**
   - Use same muted color palette (teal/slate)
   - Patient-friendly interface
   - Clear, simple navigation

2. **Mobile First:**
   - Optimized for mobile devices
   - Easy access to key features
   - Touch-friendly controls

3. **Accessibility:**
   - Large, readable text
   - Clear icons and labels
   - Easy navigation

---

## Next Steps

1. **Create Patient Layout** - Navigation and structure
2. **Build Patient Dashboard** - Overview with key metrics
3. **Implement Favorite Doctors** - Save and quick access
4. **Add Medical Records** - Appointment history and notes
5. **Create Prescription Management** - Track medications
6. **Add Health Reminders** - Appointment and medication reminders

