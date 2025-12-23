"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalDoctors: number;
  totalCustomers: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RecentBooking {
  _id: string;
  customerId: { name: string; email: string };
  doctorId: { name: string };
  date: string;
  status: string;
  payment?: { amount: number; status: string };
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
        setRecentBookings(data.recentBookings || []);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
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
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: "👥",
      color: "bg-blue-500",
      href: "/admin/users",
    },
    {
      title: "Doctors",
      value: stats?.totalDoctors || 0,
      icon: "👨‍⚕️",
      color: "bg-teal-500",
      href: "/admin/doctors",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: "📅",
      color: "bg-purple-500",
      href: "/admin/bookings",
    },
    {
      title: "Active Bookings",
      value: stats?.activeBookings || 0,
      icon: "✅",
      color: "bg-green-500",
      href: "/admin/bookings?filter=active",
    },
    {
      title: "Total Revenue",
      value: `$${((stats?.totalRevenue || 0) / 100).toFixed(2)}`,
      icon: "💰",
      color: "bg-yellow-500",
    },
    {
      title: "Pending Payments",
      value: `$${((stats?.pendingPayments || 0) / 100).toFixed(2)}`,
      icon: "⏳",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-600">Overview of your platform</p>
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
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/admin/users">
            <Button variant="outline" className="w-full justify-start">
              👥 Manage Users
            </Button>
          </Link>
          <Link href="/admin/doctors">
            <Button variant="outline" className="w-full justify-start">
              👨‍⚕️ Manage Doctors
            </Button>
          </Link>
          <Link href="/admin/bookings">
            <Button variant="outline" className="w-full justify-start">
              📅 View Bookings
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" className="w-full justify-start">
              ⚙️ Settings
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Users</h2>
          {recentUsers.length === 0 ? (
            <p className="text-slate-500 text-sm">No recent users</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="ml-3 px-2 py-1 text-xs font-medium bg-teal-100 text-teal-700 rounded">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full">
                View All Users
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <p className="text-slate-500 text-sm">No recent bookings</p>
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
                      {booking.doctorId?.name || "Unknown Doctor"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(booking.date).toLocaleDateString()} • {booking.status}
                    </p>
                  </div>
                  {booking.payment && (
                    <span className="ml-3 text-sm font-medium text-slate-900">
                      ${(booking.payment.amount / 100).toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/admin/bookings">
              <Button variant="outline" className="w-full">
                View All Bookings
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}


