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
  barberId: any;
  serviceIds: any[];
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  source: "self-service" | "barber-assisted";
  payment?: {
    amount: number;
    method: "cash" | "online" | "pending";
    status: "pending" | "paid" | "refunded";
    paidAt?: string;
  };
  createdAt: string;
}

export default function BarberDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "pending" | "confirmed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "barber") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status, session, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
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

  const updatePayment = async (
    bookingId: string,
    paymentMethod: "cash" | "online",
    paymentStatus: "paid"
  ) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment: {
            method: paymentMethod,
            status: paymentStatus,
          },
        }),
      });

      if (response.ok) {
        fetchBookings();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update payment");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment");
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      const bookingDateTime = new Date(
        `${bookingDate.toISOString().split("T")[0]}T${booking.startTime}`
      );

      // Status filter
      if (filter === "pending" && booking.status !== "pending") return false;
      if (filter === "confirmed" && booking.status !== "confirmed") return false;
      if (filter === "upcoming") {
        if (bookingDateTime <= now || booking.status === "cancelled") return false;
      }
      if (filter === "past") {
        if (bookingDateTime > now && booking.status !== "cancelled" && booking.status !== "completed") return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const customerName = (booking.customerId?.name || "").toLowerCase();
        const customerEmail = (booking.customerId?.email || "").toLowerCase();
        const customerPhone = (booking.customerId?.phone || "").toLowerCase();
        const services = (booking.serviceIds || [])
          .map((s: any) => (s.name || "").toLowerCase())
          .join(" ");

        if (
          !customerName.includes(query) &&
          !customerEmail.includes(query) &&
          !customerPhone.includes(query) &&
          !services.includes(query)
        ) {
          return false;
        }
      }

      return true;
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
    return dateA.getTime() - dateB.getTime(); // Oldest first
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-4">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Barber Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage bookings and payments</p>
            </div>
            <Link href="/barber/book-customer">
              <Button variant="primary" className="text-xs sm:text-sm px-3 sm:px-4">
                Book Customer
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by customer name, email, phone, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
          </div>
        </div>

        {/* Filter Tabs */}
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
              Upcoming
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("confirmed")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "confirmed"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "past"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Past
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
            <p className="text-gray-500 text-base mb-2">No bookings found</p>
            <Link href="/barber/book-customer">
              <Button variant="primary" className="mt-4">Book a Customer</Button>
            </Link>
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
                          {booking.customerId?.name || "Customer"}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          {booking.source === "barber-assisted" && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Walk-in
                            </span>
                          )}
                          {booking.payment?.status === "paid" && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid ({booking.payment.method})
                            </span>
                          )}
                        </div>
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
                      {booking.customerId?.phone && (
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
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span>{booking.customerId.phone}</span>
                        </div>
                      )}
                      {booking.customerId?.email && (
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
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="truncate">{booking.customerId.email}</span>
                        </div>
                      )}
                      {Array.isArray(booking.serviceIds) && booking.serviceIds.length > 0 && (
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
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {booking.payment?.amount && (
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
                          <span>Total: ${booking.payment.amount.toFixed(2)}</span>
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
                    {booking.status === "pending" && (
                      <Button
                        variant="primary"
                        className="w-full sm:w-auto text-sm"
                        onClick={() => updateBookingStatus(booking._id, "confirmed")}
                      >
                        Confirm
                      </Button>
                    )}
                    {booking.status !== "cancelled" && booking.status !== "completed" && (
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto text-sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to cancel this booking?")) {
                            updateBookingStatus(booking._id, "cancelled");
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    {booking.status === "confirmed" && (
                      <Button
                        variant="primary"
                        className="w-full sm:w-auto text-sm"
                        onClick={() => updateBookingStatus(booking._id, "completed")}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {booking.status === "completed" && booking.payment?.status !== "paid" && (
                      <>
                        <Button
                          variant="primary"
                          className="w-full sm:w-auto text-sm"
                          onClick={() => updatePayment(booking._id, "cash", "paid")}
                        >
                          Mark Paid (Cash)
                        </Button>
                        <Button
                          variant="primary"
                          className="w-full sm:w-auto text-sm"
                          onClick={() => updatePayment(booking._id, "online", "paid")}
                        >
                          Mark Paid (Online)
                        </Button>
                      </>
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
            href="/barber/dashboard"
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link
            href="/barber/book-customer"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-xs font-medium">Book</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
