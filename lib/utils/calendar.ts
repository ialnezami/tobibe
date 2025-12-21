import { createEvent, EventAttributes } from "ics";
import type { Booking } from "@/lib/types";

interface CalendarEventOptions {
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
  organizer?: {
    name: string;
    email: string;
  };
  attendees: Array<{
    name: string;
    email: string;
  }>;
}

/**
 * Generate an ICS calendar file string for a booking
 */
export function generateCalendarEvent(
  options: CalendarEventOptions
): string | null {
  try {
    const startDate = [
      options.start.getFullYear(),
      options.start.getMonth() + 1,
      options.start.getDate(),
      options.start.getHours(),
      options.start.getMinutes(),
    ] as [number, number, number, number, number];

    const endDate = [
      options.end.getFullYear(),
      options.end.getMonth() + 1,
      options.end.getDate(),
      options.end.getHours(),
      options.end.getMinutes(),
    ] as [number, number, number, number, number];

    const event: EventAttributes = {
      title: options.title,
      description: options.description,
      start: startDate,
      startInputType: "local",
      end: endDate,
      endInputType: "local",
      location: options.location,
      organizer: options.organizer
        ? {
            name: options.organizer.name,
            email: options.organizer.email,
          }
        : undefined,
      attendees: options.attendees.map((attendee) => ({
        name: attendee.name,
        email: attendee.email,
        rsvp: true,
        partstat: "NEEDS-ACTION" as const,
        role: "REQ-PARTICIPANT" as const,
      })),
      status: "CONFIRMED" as const,
      busyStatus: "BUSY" as const,
      method: "REQUEST",
      productId: "barber-booking-app",
    };

    const { error, value } = createEvent(event);

    if (error) {
      console.error("Error creating calendar event:", error);
      return null;
    }

    return value || null;
  } catch (error) {
    console.error("Error generating calendar event:", error);
    return null;
  }
}

/**
 * Generate calendar event data from a booking
 */
export function generateBookingCalendarEvent(
  booking: any,
  barber: { name: string; email: string; phone?: string },
  customer: { name: string; email: string; phone?: string },
  services: Array<{ name: string; price: number; duration: number }>,
  baseUrl: string = "http://localhost:3000"
): string | null {
  const bookingDate = new Date(booking.date);
  const [startHour, startMin] = booking.startTime.split(":").map(Number);
  const [endHour, endMin] = booking.endTime.split(":").map(Number);

  const startDateTime = new Date(bookingDate);
  startDateTime.setHours(startHour, startMin, 0, 0);

  const endDateTime = new Date(bookingDate);
  endDateTime.setHours(endHour, endMin, 0, 0);

  const serviceNames = services.map((s) => s.name).join(", ");
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

  const description = `Barber Appointment Booking

Services: ${serviceNames}
Total Price: $${totalPrice}

Customer: ${customer.name}
${customer.phone ? `Phone: ${customer.phone}` : ""}

Barber: ${barber.name}
${barber.phone ? `Phone: ${barber.phone}` : ""}

Booking ID: ${booking._id}
View booking: ${baseUrl}/bookings/${booking._id}

Please arrive on time for your appointment.`;

  return generateCalendarEvent({
    title: `Barber Appointment - ${barber.name}`,
    description,
    start: startDateTime,
    end: endDateTime,
    location: barber.phone ? `Contact: ${barber.phone}` : undefined,
    organizer: {
      name: "Barber Booking App",
      email: process.env.EMAIL_FROM || "noreply@barberbooking.com",
    },
    attendees: [
      {
        name: customer.name,
        email: customer.email,
      },
      {
        name: barber.name,
        email: barber.email,
      },
    ],
  });
}

