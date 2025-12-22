import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Doctor from "@/lib/models/Doctor";
import Service from "@/lib/models/Service";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

const sampleDoctors = [
  {
    name: "Tony's Classic Cuts",
    email: "tony@barbershop.com",
    phone: "+1-555-0101",
    address: "123 Main Street, Downtown",
    password: "password123",
    role: "doctor" as const,
    location: {
      address: "123 Main Street, Downtown, New York, NY 10001",
      coordinates: {
        lat: 40.7128,
        lng: -74.0060,
      },
    },
    description: "Professional haircuts and beard trims with 20 years of experience. Classic and modern styles.",
    photos: [],
    workingHours: {
      monday: { open: "09:00", close: "18:00", isOpen: true },
      tuesday: { open: "09:00", close: "18:00", isOpen: true },
      wednesday: { open: "09:00", close: "18:00", isOpen: true },
      thursday: { open: "09:00", close: "18:00", isOpen: true },
      friday: { open: "09:00", close: "19:00", isOpen: true },
      saturday: { open: "10:00", close: "17:00", isOpen: true },
      sunday: { open: "10:00", close: "16:00", isOpen: false },
    },
    services: [
      { name: "Haircut", description: "Professional haircut", price: 25, duration: 10 },
      { name: "Beard Trim", description: "Precise beard trimming", price: 15, duration: 10 },
      { name: "Haircut + Beard", description: "Full service", price: 35, duration: 20 },
    ],
  },
  {
    name: "Modern Barber Studio",
    email: "modern@barbershop.com",
    phone: "+1-555-0102",
    address: "456 Park Avenue, Midtown",
    password: "password123",
    role: "doctor" as const,
    location: {
      address: "456 Park Avenue, Midtown, New York, NY 10022",
      coordinates: {
        lat: 40.7580,
        lng: -73.9855,
      },
    },
    description: "Contemporary barbering with premium products. Specializing in fades, undercuts, and styling.",
    photos: [],
    workingHours: {
      monday: { open: "08:00", close: "20:00", isOpen: true },
      tuesday: { open: "08:00", close: "20:00", isOpen: true },
      wednesday: { open: "08:00", close: "20:00", isOpen: true },
      thursday: { open: "08:00", close: "20:00", isOpen: true },
      friday: { open: "08:00", close: "21:00", isOpen: true },
      saturday: { open: "09:00", close: "18:00", isOpen: true },
      sunday: { open: "10:00", close: "17:00", isOpen: true },
    },
    services: [
      { name: "Haircut", description: "Modern haircut with styling", price: 30, duration: 10 },
      { name: "Beard Trim", description: "Beard trim and shape", price: 20, duration: 10 },
      { name: "Hot Towel Shave", description: "Traditional hot towel shave", price: 25, duration: 15 },
      { name: "Full Service", description: "Haircut + Beard + Shave", price: 70, duration: 35 },
    ],
  },
  {
    name: "Elite Grooming",
    email: "elite@barbershop.com",
    phone: "+1-555-0103",
    address: "789 Broadway, SoHo",
    password: "password123",
    role: "doctor" as const,
    location: {
      address: "789 Broadway, SoHo, New York, NY 10003",
      coordinates: {
        lat: 40.7262,
        lng: -73.9978,
      },
    },
    description: "Luxury grooming experience with premium treatments and personalized service.",
    photos: [],
    workingHours: {
      monday: { open: "10:00", close: "19:00", isOpen: true },
      tuesday: { open: "10:00", close: "19:00", isOpen: true },
      wednesday: { open: "10:00", close: "19:00", isOpen: true },
      thursday: { open: "10:00", close: "19:00", isOpen: true },
      friday: { open: "10:00", close: "20:00", isOpen: true },
      saturday: { open: "10:00", close: "19:00", isOpen: true },
      sunday: { open: "11:00", close: "17:00", isOpen: true },
    },
    services: [
      { name: "Premium Haircut", description: "Luxury haircut experience", price: 45, duration: 15 },
      { name: "Beard Grooming", description: "Premium beard grooming", price: 30, duration: 15 },
      { name: "Face Treatment", description: "Face mask and treatment", price: 35, duration: 20 },
      { name: "Complete Package", description: "All services combined", price: 100, duration: 50 },
    ],
  },
  {
    name: "Quick Clips Express",
    email: "quick@barbershop.com",
    phone: "+1-555-0104",
    address: "321 5th Avenue, Financial District",
    password: "password123",
    role: "doctor" as const,
    location: {
      address: "321 5th Avenue, Financial District, New York, NY 10004",
      coordinates: {
        lat: 40.7061,
        lng: -74.0087,
      },
    },
    description: "Fast, quality cuts for busy professionals. Walk-ins welcome!",
    photos: [],
    workingHours: {
      monday: { open: "07:00", close: "19:00", isOpen: true },
      tuesday: { open: "07:00", close: "19:00", isOpen: true },
      wednesday: { open: "07:00", close: "19:00", isOpen: true },
      thursday: { open: "07:00", close: "19:00", isOpen: true },
      friday: { open: "07:00", close: "19:00", isOpen: true },
      saturday: { open: "08:00", close: "17:00", isOpen: true },
      sunday: { open: "09:00", close: "15:00", isOpen: false },
    },
    services: [
      { name: "Express Haircut", description: "Quick quality cut", price: 20, duration: 10 },
      { name: "Beard Trim", description: "Fast beard trim", price: 12, duration: 10 },
    ],
  },
  {
    name: "Vintage Barber Co.",
    email: "vintage@barbershop.com",
    phone: "+1-555-0105",
    address: "555 Bleecker Street, Greenwich Village",
    password: "password123",
    role: "doctor" as const,
    location: {
      address: "555 Bleecker Street, Greenwich Village, New York, NY 10012",
      coordinates: {
        lat: 40.7336,
        lng: -74.0027,
      },
    },
    description: "Traditional barbershop with vintage charm. Classic cuts and old-school service.",
    photos: [],
    workingHours: {
      monday: { open: "09:00", close: "18:00", isOpen: true },
      tuesday: { open: "09:00", close: "18:00", isOpen: true },
      wednesday: { open: "09:00", close: "18:00", isOpen: true },
      thursday: { open: "09:00", close: "18:00", isOpen: true },
      friday: { open: "09:00", close: "19:00", isOpen: true },
      saturday: { open: "09:00", close: "17:00", isOpen: true },
      sunday: { open: "10:00", close: "16:00", isOpen: false },
    },
    services: [
      { name: "Classic Cut", description: "Traditional men's haircut", price: 28, duration: 15 },
      { name: "Straight Razor Shave", description: "Classic straight razor shave", price: 30, duration: 20 },
      { name: "Hot Towel Treatment", description: "Hot towel facial treatment", price: 25, duration: 15 },
    ],
  },
];

export async function POST(request: NextRequest) {
  try {
    // Optional: Add a secret token for security (recommended for production)
    const authHeader = request.headers.get("authorization");
    const secretToken = process.env.SEED_SECRET_TOKEN;
    
    if (secretToken && authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if doctors already exist
    const existingDoctorCount = await Doctor.countDocuments({ role: "doctor" });
    if (existingDoctorCount > 0) {
      return NextResponse.json(
        {
          message: `Database already seeded. ${existingDoctorCount} doctors exist.`,
          doctorCount: existingDoctorCount,
        },
        { status: 200 }
      );
    }

    let createdCount = 0;

    // Create admin user
    const adminEmail = "admin@doctorbooking.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      await User.deleteOne({ email: adminEmail });
    }
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      name: "Admin User",
      email: adminEmail,
      phone: "+1-555-0000",
      password: adminPassword,
      role: "admin",
    });
    await admin.save();

    // Create doctors
    for (const doctorData of sampleDoctors) {
      // Check if user exists
      const existingUser = await User.findOne({ email: doctorData.email });
      if (existingUser) {
        await User.deleteOne({ email: doctorData.email });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(doctorData.password, 10);

      // Create doctor
      const doctor = new Doctor({
        ...doctorData,
        password: hashedPassword,
        workingHours: new Map(Object.entries(doctorData.workingHours)),
      });

      await doctor.save();

      // Create services for this doctor
      for (const serviceData of doctorData.services) {
        const service = new Service({
          doctorId: doctor._id,
          ...serviceData,
          isActive: true,
        });
        await service.save();
      }

      createdCount++;
    }

    return NextResponse.json(
      {
        message: `Successfully seeded ${createdCount} doctors with their services and created admin user.`,
        doctorCount: createdCount,
        admin: {
          email: adminEmail,
          password: "admin123",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Also allow GET for easy triggering via browser
export async function GET(request: NextRequest) {
  return POST(request);
}


