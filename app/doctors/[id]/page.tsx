"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  description?: string;
  location?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  photos?: string[];
  workingHours?: any;
}

interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchDoctorDetails();
      fetchServices();
      if (session?.user?.role === "customer") {
        checkFavorite();
      } else {
        setCheckingFavorite(false);
      }
    }
  }, [params.id, session]);

  useEffect(() => {
    if (selectedDate && params.id) {
      fetchAvailability();
    }
  }, [selectedDate, params.id]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await fetch(`/api/doctors/${params.id}`);
      const data = await response.json();
      setDoctor(data.doctor);
    } catch (error) {
      console.error("Error fetching doctor:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/services?doctorId=${params.id}`);
      const data = await response.json();
      setServices(data.services.filter((s: Service) => s.isActive));
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch(
        `/api/doctors/${params.id}/availability?date=${selectedDate}`
      );
      const data = await response.json();
      setAvailability(data.availability || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await fetch("/api/patient/favorites");
      const data = await response.json();
      if (response.ok) {
        const favorited = data.favorites?.some(
          (fav: any) => fav.doctorId._id === params.id || fav.doctorId === params.id
        );
        setIsFavorite(favorited);
      }
    } catch (error) {
      console.error("Error checking favorite:", error);
    } finally {
      setCheckingFavorite(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!session?.user || session.user.role !== "customer") {
      router.push("/login");
      return;
    }

    try {
      if (isFavorite) {
        const response = await fetch(`/api/patient/favorites?doctorId=${params.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        const response = await fetch("/api/patient/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorId: params.id }),
        });
        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite");
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotalTime = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find((s) => s._id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find((s) => s._id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTimeSlot || selectedServices.length === 0) {
      alert("Please select date, time, and at least one service");
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: params.id,
          serviceIds: selectedServices,
          date: selectedDate,
          startTime: selectedTimeSlot,
          source: "self-service",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/bookings/${data.booking._id}/success`);
      } else {
        alert(data.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking");
    }
  };

  // Get next 7 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm font-medium">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <p className="text-slate-600 text-base mb-4">Doctor not found</p>
          <Link href="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-4">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <Link
          href="/"
          className="inline-flex items-center text-teal-700 hover:text-teal-800 mb-4 text-sm font-medium"
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
          Back to doctors
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Doctor Info - Mobile First */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="sticky top-4">
              <div className="h-48 sm:h-64 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl mb-4 sm:mb-6 flex items-center justify-center -mx-6 -mt-6 shadow-sm">
                <div className="text-white text-6xl sm:text-7xl font-bold">
                  {doctor.name.charAt(0)}
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-3 sm:mb-4">
                {doctor.name}
              </h1>

              {doctor.description && (
                <p className="text-slate-600 text-sm sm:text-base mb-4 sm:mb-6">
                  {doctor.description}
                </p>
              )}

              {doctor.location?.address && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
                    Location
                  </h3>
                  <div className="flex items-start text-slate-600 text-sm sm:text-base">
                    <svg
                      className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{doctor.location.address}</span>
                  </div>
                </div>
              )}

              <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Contact</h3>
                <p className="text-slate-600 text-sm sm:text-base">{doctor.phone}</p>
                <p className="text-slate-600 text-sm sm:text-base">{doctor.email}</p>
              </div>

              {/* Add to Favorites Button - Only for patients */}
              {session?.user?.role === "customer" && !checkingFavorite && (
                <div className="pt-4 border-t border-slate-200">
                  <Button
                    variant={isFavorite ? "secondary" : "outline"}
                    className="w-full"
                    onClick={handleToggleFavorite}
                  >
                    {isFavorite ? (
                      <>
                        <span className="mr-2">⭐</span>
                        Remove from Favorites
                      </>
                    ) : (
                      <>
                        <span className="mr-2">☆</span>
                        Add to Favorites
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Booking - Mobile First */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">
                Book Appointment
              </h2>

              {/* Services Selection */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold text-slate-900 mb-3 sm:mb-4 text-sm sm:text-base">
                  Select Services
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {services.map((service) => (
                    <label
                      key={service._id}
                      className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedServices.includes(service._id)
                          ? "border-teal-600 bg-teal-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service._id)}
                        onChange={() => handleServiceToggle(service._id)}
                        className="mr-3 sm:mr-4 w-5 h-5 text-teal-600 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                          <span className="font-medium text-gray-900 text-sm sm:text-base">
                            {service.name}
                          </span>
                          <span className="text-teal-700 font-semibold text-sm sm:text-base">
                            ${service.price}
                          </span>
                        </div>
                        {service.description && (
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            {service.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">{service.duration} minutes</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Selection - Mobile Optimized */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold text-slate-900 mb-3 sm:mb-4 text-sm sm:text-base">
                  Select Date
                </h3>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 overflow-x-auto pb-2">
                  {getAvailableDates().map((date) => {
                    const dateObj = new Date(date);
                    const isSelected = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-colors text-center ${
                          isSelected
                            ? "border-teal-600 bg-teal-700 text-white"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-xs">{dateObj.toLocaleDateString("en-US", { weekday: "short" })}</div>
                        <div className="text-base sm:text-lg font-semibold">{dateObj.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selection - Mobile Optimized */}
              {selectedDate && (
                <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold text-slate-900 mb-3 sm:mb-4 text-sm sm:text-base">
                  Select Time
                </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availability
                      .filter((slot) => slot.isAvailable)
                      .map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTimeSlot(slot.startTime)}
                          className={`p-2 sm:p-3 rounded-lg border-2 transition-colors text-sm sm:text-base ${
                            selectedTimeSlot === slot.startTime
                              ? "border-teal-600 bg-teal-700 text-white"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                  </div>
                  {availability.filter((slot) => slot.isAvailable).length === 0 && (
                    <p className="text-slate-500 text-sm">No available time slots for this date</p>
                  )}
                </div>
              )}

              {/* Summary - Mobile Optimized */}
              {selectedServices.length > 0 && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
                    Booking Summary
                  </h3>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Services:</span>
                      <span className="font-medium">{selectedServices.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Time:</span>
                      <span className="font-medium">{calculateTotalTime()} minutes</span>
                    </div>
                    <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-slate-200">
                      <span>Total Price:</span>
                      <span className="text-teal-700">${calculateTotalPrice()}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full text-sm sm:text-base py-3"
                onClick={handleBook}
                disabled={
                  !selectedDate ||
                  !selectedTimeSlot ||
                  selectedServices.length === 0
                }
              >
                Book Appointment
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
