"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          router.push(`/login?redirect=/bookings/${params.id}/success`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

  const bookingDate = new Date(booking.date);
  const formattedDate = bookingDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-2xl w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">Your appointment has been successfully booked</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <h2 className="font-semibold text-gray-900 mb-4">Booking Details</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Doctor: </span>
              <span className="font-medium">
                {typeof booking.doctorId === "object"
                  ? booking.doctorId.name
                  : "Loading..."}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Date: </span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div>
              <span className="text-gray-600">Time: </span>
              <span className="font-medium">
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Services: </span>
              <span className="font-medium">
                {Array.isArray(booking.serviceIds)
                  ? booking.serviceIds
                      .map((s: any) => (typeof s === "object" ? s.name : s))
                      .join(", ")
                  : "Loading..."}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status: </span>
              <span className="font-medium capitalize">{booking.status}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          {session?.user?.role === "doctor" ? (
            <>
              <Link href="/doctor/dashboard">
                <Button variant="primary">Back to Dashboard</Button>
              </Link>
              <Link href="/doctor/book-customer">
                <Button variant="outline">Book Another Customer</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/my-bookings">
                <Button variant="primary">View My Bookings</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Book Another</Button>
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

