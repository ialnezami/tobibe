import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, existsSync } from "fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connect";
import Doctor from "@/lib/models/Doctor";
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

const sampleDoctors = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@healthcare.com",
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
    description: "Board-certified family physician with 20 years of experience. Specializing in preventive care, chronic disease management, and general health consultations.",
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
      { name: "General Consultation", description: "Comprehensive health review and assessment of your current situation", price: 150, duration: 30 },
      { name: "Annual Physical Exam", description: "Complete annual health checkup and screening", price: 200, duration: 45 },
      { name: "Follow-up Visit", description: "Follow-up appointment for ongoing care", price: 100, duration: 20 },
      { name: "Health Screening", description: "Preventive health screening and tests", price: 175, duration: 30 },
    ],
  },
  {
    name: "Dr. Michael Chen",
    email: "michael.chen@healthcare.com",
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
    description: "Internal medicine specialist with expertise in adult health, chronic conditions, and preventive medicine. Available for extended hours.",
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
      { name: "General Consultation", description: "Review of your health situation and medical concerns", price: 180, duration: 30 },
      { name: "Chronic Disease Management", description: "Ongoing management of chronic conditions", price: 200, duration: 40 },
      { name: "Preventive Care Visit", description: "Preventive health assessment and recommendations", price: 160, duration: 25 },
      { name: "Medication Review", description: "Comprehensive review of current medications", price: 120, duration: 20 },
    ],
  },
  {
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@healthcare.com",
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
    description: "Experienced primary care physician offering personalized healthcare services. Specializing in women's health, wellness, and preventive medicine.",
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
      { name: "General Consultation", description: "Comprehensive review of your health situation and concerns", price: 170, duration: 30 },
      { name: "Wellness Exam", description: "Complete wellness assessment and health planning", price: 220, duration: 45 },
      { name: "Women's Health Consultation", description: "Specialized women's health assessment", price: 200, duration: 35 },
      { name: "Health Counseling", description: "Health education and lifestyle counseling", price: 140, duration: 25 },
    ],
  },
  {
    name: "Dr. James Wilson",
    email: "james.wilson@healthcare.com",
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
    description: "Board-certified general practitioner offering convenient appointments for busy professionals. Walk-ins welcome for urgent consultations.",
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
      { name: "General Consultation", description: "Quick review of your health situation and immediate concerns", price: 130, duration: 20 },
      { name: "Express Consultation", description: "Brief consultation for urgent health matters", price: 100, duration: 15 },
      { name: "Health Check", description: "Basic health assessment and vital signs check", price: 90, duration: 15 },
    ],
  },
  {
    name: "Dr. Patricia Anderson",
    email: "patricia.anderson@healthcare.com",
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
    description: "Experienced family medicine physician with a focus on holistic health and patient-centered care. Providing comprehensive medical services.",
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
      { name: "General Consultation", description: "Complete review of your health situation and comprehensive assessment", price: 160, duration: 30 },
      { name: "Comprehensive Health Review", description: "In-depth health review and situation analysis", price: 250, duration: 50 },
      { name: "Family Health Consultation", description: "Family-focused health consultation and planning", price: 200, duration: 40 },
      { name: "Second Opinion", description: "Review of previous diagnosis and treatment recommendations", price: 180, duration: 35 },
    ],
  },
];

async function seedDoctors() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    // Check if doctors already exist
    const existingDoctorCount = await Doctor.countDocuments({ role: "doctor" });
    if (existingDoctorCount > 0) {
      console.log(`✅ ${existingDoctorCount} doctors already exist. Skipping seed.`);
      process.exit(0);
    }

    console.log("No doctors found. Seeding database...");

    // Create admin user
    console.log("Creating admin user...");
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
    console.log(`✅ Created admin user: ${adminEmail} / admin123`);

    // Create doctors
    for (const doctorData of sampleDoctors) {
      console.log(`Creating doctor: ${doctorData.name}...`);

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

      console.log(`✅ Created ${doctorData.name} with ${doctorData.services.length} services`);
    }

    console.log("\n✅ Seed completed successfully!");
    console.log(`Created 1 admin user and ${sampleDoctors.length} doctors with their services.`);
    console.log("\nAdmin credentials:");
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: admin123`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding doctors:", error);
    process.exit(1);
  }
}

seedDoctors();
