"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Stats {
  totalBookings: number;
  upcomingBookings: number;
  pastBookings: number;
  favoriteDoctorsCount: number;
}

interface NextAppointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  doctorId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location?: { address: string };
  };
  status: string;
}

interface RecentBooking {
  _id: string;
  date: string;
  startTime: string;
  doctorId: { name: string };
  status: string;
  createdAt: string;
}

export default function PatientDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [nextAppointment, setNextAppointment] = useState<NextAppointment | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/patient/dashboard");
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
        setNextAppointment(data.nextAppointment);
        setRecentBookings(data.recentBookings || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntil = (date: string) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Appointments",
      value: stats?.totalBookings || 0,
      icon: "📅",
      color: "bg-blue-500",
      href: "/patient/appointments",
    },
    {
      title: "Upcoming",
      value: stats?.upcomingBookings || 0,
      icon: "✅",
      color: "bg-green-500",
      href: "/patient/appointments?filter=upcoming",
    },
    {
      title: "Past Appointments",
      value: stats?.pastBookings || 0,
      icon: "📋",
      color: "bg-purple-500",
      href: "/patient/appointments?filter=past",
    },
    {
      title: "Favorite Doctors",
      value: stats?.favoriteDoctorsCount || 0,
      icon: "⭐",
      color: "bg-yellow-500",
      href: "/patient/favorites",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          My Health Dashboard
        </h1>
        <p className="text-slate-600">Welcome back! Here's your health overview</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => (
          <Card
            key={index}
            className={`${card.href ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}`}
            onClick={() => card.href && (window.location.href = card.href)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{card.title}</p>
                <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointment */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Next Appointment</h2>
          {nextAppointment ? (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {nextAppointment.doctorId.name}
                    </p>
                    {nextAppointment.doctorId.location?.address && (
                      <p className="text-sm text-slate-600 mt-1">
                        📍 {nextAppointment.doctorId.location.address}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    nextAppointment.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {nextAppointment.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(nextAppointment.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Time:</span> {nextAppointment.startTime} - {nextAppointment.endTime}
                  </p>
                  {getDaysUntil(nextAppointment.date) >= 0 && (
                    <p className="text-sm font-medium text-teal-700 mt-2">
                      {getDaysUntil(nextAppointment.date) === 0
                        ? "Today!"
                        : getDaysUntil(nextAppointment.date) === 1
                        ? "Tomorrow"
                        : `${getDaysUntil(nextAppointment.date)} days away`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Link href={`/bookings/${nextAppointment._id}`} className="flex-1">
                  <Button variant="primary" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Link href={`/doctors/${nextAppointment.doctorId._id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Doctor Profile
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">No upcoming appointments</p>
              <Link href="/">
                <Button variant="primary">Book Appointment</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start">
                📅 Book Appointment
              </Button>
            </Link>
            <Link href="/patient/favorites">
              <Button variant="outline" className="w-full justify-start">
                ⭐ Favorite Doctors
              </Button>
            </Link>
            <Link href="/patient/records">
              <Button variant="outline" className="w-full justify-start">
                📋 Medical Records
              </Button>
            </Link>
            <Link href="/patient/prescriptions">
              <Button variant="outline" className="w-full justify-start">
                💊 Prescriptions
              </Button>
            </Link>
            <Link href="/patient/reminders">
              <Button variant="outline" className="w-full justify-start">
                🔔 Reminders
              </Button>
            </Link>
            <Link href="/patient/profile">
              <Button variant="outline" className="w-full justify-start">
                👤 Health Profile
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Appointments */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Appointments</h2>
          {recentBookings.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No recent appointments</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {booking.doctorId?.name || "Unknown Doctor"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(booking.date).toLocaleDateString()} • {booking.startTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
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
                    <Link href={`/bookings/${booking._id}`}>
                      <Button variant="outline" className="text-xs px-2 py-1">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/patient/appointments">
              <Button variant="outline" className="w-full">
                View All Appointments
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}


