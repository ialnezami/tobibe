import { TimeSlot } from "@/lib/types";

/**
 * Generate time slots for a given date and working hours
 * Default slot duration is 30 minutes
 */
export function generateTimeSlots(
  date: Date,
  workingHours: { open: string; close: string; isOpen: boolean },
  slotDuration: number = 30
): Array<{ startTime: string; endTime: string }> {
  if (!workingHours.isOpen) {
    return [];
  }

  const slots: Array<{ startTime: string; endTime: string }> = [];
  const [openHour, openMinute] = workingHours.open.split(":").map(Number);
  const [closeHour, closeMinute] = workingHours.close.split(":").map(Number);

  const startTime = new Date(date);
  startTime.setHours(openHour, openMinute, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(closeHour, closeMinute, 0, 0);

  let currentTime = new Date(startTime);

  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

    if (slotEnd <= endTime) {
      slots.push({
        startTime: formatTime(currentTime),
        endTime: formatTime(slotEnd),
      });
    }

    currentTime = slotEnd;
  }

  return slots;
}

/**
 * Format a Date object to HH:mm string
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Calculate total booking duration based on services
 */
export function calculateBookingDuration(
  serviceDurations: number[]
): number {
  return serviceDurations.reduce((total, duration) => total + duration, 0);
}

/**
 * Check if a time slot conflicts with existing bookings
 */
export function hasTimeSlotConflict(
  startTime: string,
  endTime: string,
  existingSlots: TimeSlot[]
): boolean {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  return existingSlots.some((slot) => {
    if (!slot.isAvailable || slot.isBlocked) {
      const [slotStartHour, slotStartMin] = slot.startTime.split(":").map(Number);
      const [slotEndHour, slotEndMin] = slot.endTime.split(":").map(Number);

      // Check for overlap
      const slotStart = slotStartHour * 60 + slotStartMin;
      const slotEnd = slotEndHour * 60 + slotEndMin;
      const bookingStart = startHour * 60 + startMin;
      const bookingEnd = endHour * 60 + endMin;

      return (
        (bookingStart >= slotStart && bookingStart < slotEnd) ||
        (bookingEnd > slotStart && bookingEnd <= slotEnd) ||
        (bookingStart <= slotStart && bookingEnd >= slotEnd)
      );
    }

    return false;
  });
}

