"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Booking {
  _id: string;
  customerId: any;
  doctorId: any;
  serviceIds: any[];
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  source: "self-service" | "doctor-assisted";
  payment?: {
    amount: number;
    method: "cash" | "online" | "pending";
    status: "pending" | "paid" | "refunded";
    paidAt?: string;
  };
  createdAt: string;
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        fetchBookings(); // Refresh bookings
      } else {
        const data = await response.json();
        alert(data.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      const bookingDateTime = new Date(
        `${bookingDate.toISOString().split("T")[0]}T${booking.startTime}`
      );

      if (filter === "upcoming") {
        return bookingDateTime > now && booking.status !== "cancelled";
      }
      if (filter === "past") {
        return bookingDateTime <= now || booking.status === "cancelled" || booking.status === "completed";
      }
      return true; // "all"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateTotalPrice = (booking: Booking) => {
    if (booking.payment?.amount) {
      return booking.payment.amount;
    }
    // Fallback: calculate from services if payment amount not set
    if (Array.isArray(booking.serviceIds)) {
      return booking.serviceIds.reduce((total: number, service: any) => {
        return total + (service.price || 0);
      }, 0);
    }
    return 0;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading bookings...</p>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-4">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Filter Tabs - Mobile First */}
        <div className="mb-4 sm:mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "upcoming"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Upcoming (
              {bookings.filter(
                (b) =>
                  new Date(`${b.date}T${b.startTime}`) > new Date() &&
                  b.status !== "cancelled"
              ).length}
              )
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "past"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Past (
              {bookings.filter(
                (b) =>
                  new Date(`${b.date}T${b.startTime}`) <= new Date() ||
                  b.status === "cancelled" ||
                  b.status === "completed"
              ).length}
              )
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {sortedBookings.length === 0 ? (
          <Card className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 text-base mb-2">
              {filter === "upcoming"
                ? "No upcoming bookings"
                : filter === "past"
                ? "No past bookings"
                : "No bookings found"}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {filter === "upcoming" || filter === "all"
                ? "Start by booking an appointment with a doctor"
                : ""}
            </p>
            {filter !== "past" && (
              <Link href="/">
                <Button variant="primary">Browse Doctors</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {sortedBookings.map((booking) => (
              <Card
                key={booking._id}
                className="border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {typeof booking.doctorId === "object"
                            ? booking.doctorId.name
                            : "Doctor"}
                        </h3>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mt-3">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {booking.startTime} - {booking.endTime}
                        </span>
                      </div>
                      {Array.isArray(booking.serviceIds) &&
                        booking.serviceIds.length > 0 && (
                          <div className="flex items-start">
                            <svg
                              className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                              />
                            </svg>
                            <div>
                              {booking.serviceIds.map((service: any, idx: number) => (
                                <span key={idx} className="block">
                                  {typeof service === "object" ? service.name : "Service"}
                                  {idx < booking.serviceIds.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      {calculateTotalPrice(booking) > 0 && (
                        <div className="flex items-center font-semibold text-gray-900">
                          <svg
                            className="w-4 h-4 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Total: ${calculateTotalPrice(booking)}</span>
                          {booking.payment?.method &&
                            booking.payment.method !== "pending" && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({booking.payment.method})
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 sm:w-auto w-full">
                    <Link href={`/bookings/${booking._id}`}>
                      <Button variant="outline" className="w-full sm:w-auto text-sm">
                        View Details
                      </Button>
                    </Link>
                    {booking.status !== "cancelled" &&
                      booking.status !== "completed" &&
                      new Date(`${booking.date}T${booking.startTime}`) > new Date() && (
                        <Button
                          variant="secondary"
                          className="w-full sm:w-auto text-sm"
                          onClick={() => handleCancel(booking._id)}
                        >
                          Cancel
                        </Button>
                      )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden z-50">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/"
            className="flex flex-col items-center px-4 py-2 text-gray-600"
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-xs font-medium">Browse</span>
          </Link>
          <Link
            href="/my-bookings"
            className="flex flex-col items-center px-4 py-2 text-blue-600"
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-medium">Bookings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
