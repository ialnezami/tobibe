export interface User {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  password?: string;
  role: "customer" | "doctor";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Doctor extends User {
  location?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  description?: string;
  photos?: string[];
  workingHours?: WorkingHours;
}

export interface WorkingHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

export interface Service {
  _id?: string;
  doctorId: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimeSlot {
  _id?: string;
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBlocked: boolean;
  bookingId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Booking {
  _id?: string;
  customerId: string;
  doctorId: string;
  serviceIds: string[];
  date: Date;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  source: "self-service" | "doctor-assisted";
  payment?: {
    amount: number;
    method: "cash" | "online" | "pending";
    status: "pending" | "paid" | "refunded";
    paidAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

