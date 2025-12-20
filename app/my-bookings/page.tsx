"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

interface Booking {
  _id: string;
  customerId: any;
  barberId: any;
  serviceIds: any[];
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  payment?: {
    amount: number;
    method: string;
    status: string;
  };
}

export default function MyBookingsPage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && user) {
      fetchBookings();
    }
  }, [status, user, router]);

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

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchBookings();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    if (filter === "upcoming") {
      return bookingDate >= now && booking.status !== "cancelled";
    } else if (filter === "past") {
      return bookingDate < now || booking.status === "cancelled";
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">
            Track your appointments and booking history
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "upcoming" ? "primary" : "outline"}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === "past" ? "primary" : "outline"}
            onClick={() => setFilter("past")}
          >
            Past
          </Button>
        </div>

        {filteredBookings.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bookings found</p>
              {user?.role === "customer" && (
                <Link href="/barbers" className="text-blue-600 hover:underline mt-4 inline-block">
                  Browse barbers
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <Card key={booking._id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold">
                        {user?.role === "customer"
                          ? booking.barberId?.name || "Barber"
                          : booking.customerId?.name || "Customer"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="text-gray-600 space-y-1">
                      <p>
                        <strong>Date:</strong> {formatDate(booking.date)}
                      </p>
                      <p>
                        <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                      </p>
                      <p>
                        <strong>Services:</strong>{" "}
                        {booking.serviceIds
                          ?.map((s: any) => s.name || "Service")
                          .join(", ")}
                      </p>
                      {booking.payment && (
                        <p>
                          <strong>Amount:</strong> ${booking.payment.amount.toFixed(2)} (
                          {booking.payment.method === "pending"
                            ? "Not paid"
                            : booking.payment.method === "cash"
                            ? "Cash"
                            : "Online"}
                          )
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {filter === "upcoming" && booking.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        onClick={() => cancelBooking(booking._id)}
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
      </div>
    </div>
  );
}

