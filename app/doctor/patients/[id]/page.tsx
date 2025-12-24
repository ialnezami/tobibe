"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Booking {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  serviceIds: string[];
  payment?: { amount: number; status: string; method: string };
  createdAt: string;
}

export default function PatientDetailPage() {
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientDetails();
  }, [params.id]);

  const fetchPatientDetails = async () => {
    try {
      // Fetch patient info and bookings
      const [patientRes, bookingsRes] = await Promise.all([
        fetch(`/api/users/${params.id}`),
        fetch(`/api/bookings?customerId=${params.id}`),
      ]);

      const patientData = await patientRes.json();
      const bookingsData = await bookingsRes.json();

      if (patientRes.ok) {
        setPatient(patientData.user);
      }
      if (bookingsRes.ok) {
        setBookings(bookingsData.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">Loading patient details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/doctor/patients" className="text-teal-700 hover:text-teal-800 text-sm font-medium mb-4 inline-block">
          ← Back to Patients
        </Link>
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Patient Details
        </h1>
        <p className="text-slate-600">View patient information and booking history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Patient Information</h2>
          {patient ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">Name</p>
                <p className="text-base font-medium text-slate-900">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Email</p>
                <p className="text-base text-slate-900">{patient.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Phone</p>
                <p className="text-base text-slate-900">{patient.phone}</p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <Link href={`/doctor/book-customer?customerId=${patient._id}`}>
                  <Button variant="primary" className="w-full">
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Patient not found</p>
          )}
        </Card>

        {/* Booking History */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Booking History</h2>
          {bookings.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No bookings found</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  {booking.payment && (
                    <p className="text-sm text-slate-600">
                      Payment: ${(booking.payment.amount / 100).toFixed(2)} ({booking.payment.status})
                    </p>
                  )}
                  <div className="mt-2">
                    <Link href={`/bookings/${booking._id}`}>
                      <Button variant="outline" className="text-xs px-2 py-1">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}



