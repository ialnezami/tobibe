import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, existsSync } from "fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connect";
import Barber from "@/lib/models/Barber";
import Service from "@/lib/models/Service";
import User from "@/lib/models/User";

// Load environment variables from .env.local
// Use current working directory (where npm run seed is executed from)
const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  const envContent = readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const sampleBarbers = [
  {
    name: "Tony's Classic Cuts",
    email: "tony@barbershop.com",
    phone: "+1-555-0101",
    address: "123 Main Street, Downtown",
    password: "password123",
    role: "barber" as const,
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
    role: "barber" as const,
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
    role: "barber" as const,
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
    role: "barber" as const,
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
    role: "barber" as const,
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

async function seedBarbers() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    // Check if barbers already exist
    const existingBarberCount = await Barber.countDocuments({ role: "barber" });
    if (existingBarberCount > 0) {
      console.log(`✅ ${existingBarberCount} barbers already exist. Skipping seed.`);
      process.exit(0);
    }

    console.log("No barbers found. Seeding database...");

    for (const barberData of sampleBarbers) {
      console.log(`Creating barber: ${barberData.name}...`);

      // Check if user exists
      const existingUser = await User.findOne({ email: barberData.email });
      if (existingUser) {
        await User.deleteOne({ email: barberData.email });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(barberData.password, 10);

      // Create barber
      const barber = new Barber({
        ...barberData,
        password: hashedPassword,
        workingHours: new Map(Object.entries(barberData.workingHours)),
      });

      await barber.save();

      // Create services for this barber
      for (const serviceData of barberData.services) {
        const service = new Service({
          barberId: barber._id,
          ...serviceData,
          isActive: true,
        });
        await service.save();
      }

      console.log(`✅ Created ${barberData.name} with ${barberData.services.length} services`);
    }

    console.log("\n✅ Seed completed successfully!");
    console.log(`Created ${sampleBarbers.length} barbers with their services.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding barbers:", error);
    process.exit(1);
  }
}

seedBarbers();
