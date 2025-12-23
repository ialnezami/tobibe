"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSession } from "next-auth/react";

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
  updatedAt: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBooking();
    }
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?redirect=/bookings/${params.id}`);
          return;
        }
        if (response.status === 403) {
          console.error("Access denied to booking");
        }
        if (response.status === 404) {
          console.error("Booking not found");
        }
        setBooking(null);
        return;
      }
      
      setBooking(data.booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch(`/api/bookings/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        router.push("/my-bookings");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateTotalPrice = (booking: Booking) => {
    if (booking.payment?.amount) {
      return booking.payment.amount;
    }
    if (Array.isArray(booking.serviceIds)) {
      return booking.serviceIds.reduce((total: number, service: any) => {
        return total + (service.price || 0);
      }, 0);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Booking Not Found
            </h1>
            <p className="text-slate-600 mb-6">
              The booking you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/my-bookings">
              <Button variant="primary">View My Bookings</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const canCancel =
    booking.status !== "cancelled" &&
    booking.status !== "completed" &&
    new Date(`${booking.date}T${booking.startTime}`) > new Date();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-4">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <Link
          href="/my-bookings"
          className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-4 text-sm"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          Back to My Bookings
        </Link>

        <Card>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 pb-6 border-b">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Booking Details
              </h1>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  booking.status
                )}`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            {canCancel && (
              <Button
                variant="secondary"
                onClick={handleCancel}
                isLoading={cancelling}
                className="mt-4 sm:mt-0 w-full sm:w-auto"
              >
                Cancel Booking
              </Button>
            )}
          </div>

          {/* Booking Information */}
          <div className="space-y-6">
            {/* Doctor Info */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Doctor</h2>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-slate-900 text-base">
                  {typeof booking.doctorId === "object"
                    ? booking.doctorId.name
                    : "Doctor"}
                </p>
                {typeof booking.doctorId === "object" && booking.doctorId.phone && (
                  <p className="text-slate-600 text-sm mt-1">{booking.doctorId.phone}</p>
                )}
                {typeof booking.doctorId === "object" && booking.doctorId.email && (
                  <p className="text-slate-600 text-sm">{booking.doctorId.email}</p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Date & Time</h2>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center text-base">
                  <svg
                    className="w-5 h-5 mr-3 text-slate-500"
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
                  <span className="font-medium">{formatDate(booking.date)}</span>
                </div>
                <div className="flex items-center text-base">
                  <svg
                    className="w-5 h-5 mr-3 text-slate-500"
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
                  <span className="font-medium">
                    {booking.startTime} - {booking.endTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Services */}
            {Array.isArray(booking.serviceIds) && booking.serviceIds.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Services</h2>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  {booking.serviceIds.map((service: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between pb-3 border-b border-slate-200 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {typeof service === "object" ? service.name : "Service"}
                        </p>
                        {typeof service === "object" && service.description && (
                          <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                        )}
                        {typeof service === "object" && service.duration && (
                          <p className="text-xs text-slate-500 mt-1">
                            {service.duration} minutes
                          </p>
                        )}
                      </div>
                      {typeof service === "object" && service.price && (
                        <p className="font-semibold text-slate-900 ml-4">
                          ${service.price}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Info */}
            {calculateTotalPrice(booking) > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Payment</h2>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="text-xl font-bold text-slate-900">
                      ${calculateTotalPrice(booking)}
                    </span>
                  </div>
                  {booking.payment?.method && booking.payment.method !== "pending" && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Payment Method:</span>
                      <span className="font-medium text-slate-900 capitalize">
                        {booking.payment.method}
                      </span>
                    </div>
                  )}
                  {booking.payment?.status && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Payment Status:</span>
                      <span
                        className={`font-medium px-2 py-1 rounded ${
                          booking.payment.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : booking.payment.status === "refunded"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.payment.status.charAt(0).toUpperCase() +
                          booking.payment.status.slice(1)}
                      </span>
                    </div>
                  )}
                  {booking.payment?.paidAt && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Paid At:</span>
                      <span className="text-slate-900">
                        {new Date(booking.payment.paidAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Booking Info */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Booking Information</h2>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Booking Source:</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {booking.source.replace("-", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Created:</span>
                  <span className="text-slate-900">
                    {new Date(booking.createdAt).toLocaleString()}
                  </span>
                </div>
                {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Updated:</span>
                    <span className="text-slate-900">
                      {new Date(booking.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
              <Link href="/my-bookings" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Bookings
                </Button>
              </Link>
              {canCancel && (
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  isLoading={cancelling}
                  className="flex-1"
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 sm:hidden z-50">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/"
            className="flex flex-col items-center px-4 py-2 text-slate-600"
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
            className="flex flex-col items-center px-4 py-2 text-teal-600"
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


