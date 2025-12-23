"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Stats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  totalPatients: number;
  activeServices: number;
  averageAppointmentValue: number;
}

interface TodayAppointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  customerId: { name: string; email: string; phone: string };
  status: string;
  serviceIds: string[];
}

interface RecentBooking {
  _id: string;
  date: string;
  startTime: string;
  customerId: { name: string; email: string };
  status: string;
  payment?: { amount: number; status: string };
  createdAt: string;
}

export default function DoctorDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/doctor/dashboard");
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
        setTodayAppointments(data.todayAppointments || []);
        setRecentBookings(data.recentBookings || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
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
      href: "/doctor/appointments",
    },
    {
      title: "Upcoming",
      value: stats?.upcomingBookings || 0,
      icon: "✅",
      color: "bg-green-500",
      href: "/doctor/appointments?filter=upcoming",
    },
    {
      title: "Total Revenue",
      value: `$${((stats?.totalRevenue || 0) / 100).toFixed(2)}`,
      icon: "💰",
      color: "bg-yellow-500",
      href: "/doctor/finances",
    },
    {
      title: "Pending Payments",
      value: `$${((stats?.pendingPayments || 0) / 100).toFixed(2)}`,
      icon: "⏳",
      color: "bg-orange-500",
      href: "/doctor/finances",
    },
    {
      title: "Total Patients",
      value: stats?.totalPatients || 0,
      icon: "👥",
      color: "bg-purple-500",
      href: "/doctor/patients",
    },
    {
      title: "Active Services",
      value: stats?.activeServices || 0,
      icon: "🩺",
      color: "bg-teal-500",
      href: "/doctor/services",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          👨‍⚕️ Doctor Dashboard
        </h1>
        <p className="text-slate-600">Overview of your practice</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/doctor/book-customer">
            <Button variant="primary" className="w-full justify-start">
              📝 Book Customer
            </Button>
          </Link>
          <Link href="/doctor/services">
            <Button variant="outline" className="w-full justify-start">
              🩺 Manage Services
            </Button>
          </Link>
          <Link href="/doctor/availability">
            <Button variant="outline" className="w-full justify-start">
              ⏰ Set Availability
            </Button>
          </Link>
          <Link href="/doctor/patients">
            <Button variant="outline" className="w-full justify-start">
              👥 View Patients
              </Button>
            </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">📅 Today's Schedule</h2>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-500 text-sm mb-4">No appointments scheduled for today</p>
              <Link href="/doctor/book-customer">
                <Button variant="outline">📝 Book Appointment</Button>
              </Link>
        </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                      <p className="font-semibold text-slate-900">
                        {appointment.customerId.name}
                      </p>
                      <p className="text-xs text-slate-500">{appointment.customerId.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {appointment.status}
                              </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Time:</span> {appointment.startTime} - {appointment.endTime}
                  </p>
                  <div className="mt-2">
                    <Link href={`/bookings/${appointment._id}`}>
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

        {/* Recent Bookings */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">🕐 Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-slate-500 text-sm">No recent bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {booking.customerId?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(booking.date).toLocaleDateString()} • {booking.startTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                    {booking.payment && (
                      <span className="text-xs font-medium text-slate-900">
                        ${(booking.payment.amount / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
            ))}
          </div>
        )}
          <div className="mt-4">
            <Link href="/doctor/appointments">
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
