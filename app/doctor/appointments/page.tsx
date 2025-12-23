"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Booking {
  _id: string;
  customerId: { name: string; email: string; phone: string };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  serviceIds: string[];
  payment?: { amount: number; status: string; method: string };
  createdAt: string;
}

export default function DoctorAppointmentsPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const filterParam = searchParams.get("filter") as any;
    if (filterParam) {
      setFilter(filterParam);
    }
    fetchBookings();
  }, [filter, searchParams]);

  useEffect(() => {
    fetchBookings();
  }, [search]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (response.ok) {
        let filteredBookings = data.bookings || [];
        
        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filteredBookings = filteredBookings.filter((b: Booking) =>
            b.customerId?.name?.toLowerCase().includes(searchLower) ||
            b.customerId?.email?.toLowerCase().includes(searchLower)
          );
        }

        setBookings(filteredBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBookings();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking");
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      
      if (filter === "upcoming") {
        return bookingDate >= now && ["pending", "confirmed"].includes(booking.status);
      }
      if (filter === "past") {
        return bookingDate < now;
      }
      if (filter === "pending" || filter === "confirmed" || filter === "completed" || filter === "cancelled") {
        return booking.status === filter;
      }
      return true;
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Appointments
        </h1>
        <p className="text-slate-600">Manage all your appointments</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Search Appointments"
              type="text"
              placeholder="Search by patient name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Filter by Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-base bg-white"
            >
              <option value="all">All Appointments</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Appointments List */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
              <p className="text-slate-600 text-sm">Loading appointments...</p>
            </div>
          </div>
        </Card>
      ) : getFilteredBookings().length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No appointments found</p>
            <Link href="/doctor/book-customer">
              <Button variant="primary">Book Appointment</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {getFilteredBookings().map((booking) => (
            <Card key={booking._id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {booking.customerId?.name || "Unknown Patient"}
                      </h3>
                      <p className="text-sm text-slate-600">{booking.customerId?.email}</p>
                      <p className="text-xs text-slate-500">{booking.customerId?.phone}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : booking.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(booking.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span> {booking.startTime} - {booking.endTime}
                    </p>
                    {booking.payment && (
                      <p>
                        <span className="font-medium">Amount:</span> $
                        {(booking.payment.amount / 100).toFixed(2)} ({booking.payment.status})
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/bookings/${booking._id}`}>
                    <Button variant="outline" className="text-xs sm:text-sm">
                      View Details
                    </Button>
                  </Link>
                  {booking.status === "pending" && (
                    <Button
                      variant="primary"
                      className="text-xs sm:text-sm"
                      onClick={() => updateStatus(booking._id, "confirmed")}
                    >
                      Confirm
                    </Button>
                  )}
                  {["pending", "confirmed"].includes(booking.status) && (
                    <Button
                      variant="outline"
                      className="text-xs sm:text-sm text-red-600 hover:text-red-700 hover:border-red-300"
                      onClick={() => updateStatus(booking._id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  )}
                  {booking.status === "confirmed" && (
                    <Button
                      variant="primary"
                      className="text-xs sm:text-sm"
                      onClick={() => updateStatus(booking._id, "completed")}
                    >
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


