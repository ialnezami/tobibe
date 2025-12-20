"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Barber {
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

export default function BarberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchBarberDetails();
      fetchServices();
    }
  }, [params.id]);

  useEffect(() => {
    if (selectedDate && params.id) {
      fetchAvailability();
    }
  }, [selectedDate, params.id]);

  const fetchBarberDetails = async () => {
    try {
      const response = await fetch(`/api/barbers/${params.id}`);
      const data = await response.json();
      setBarber(data.barber);
    } catch (error) {
      console.error("Error fetching barber:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/services?barberId=${params.id}`);
      const data = await response.json();
      setServices(data.services.filter((s: Service) => s.isActive));
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch(
        `/api/barbers/${params.id}/availability?date=${selectedDate}`
      );
      const data = await response.json();
      setAvailability(data.availability || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
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
          barberId: params.id,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading barber details...</p>
        </div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Barber not found</p>
          <Link href="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to barbers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Barber Info */}
          <div className="lg:col-span-1">
            <Card>
              <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-white text-6xl font-bold">
                  {barber.name.charAt(0)}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{barber.name}</h1>
              
              {barber.description && (
                <p className="text-gray-600 mb-6">{barber.description}</p>
              )}

              {barber.location?.address && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <div className="flex items-start text-gray-600">
                    <svg
                      className="w-5 h-5 mr-2 mt-0.5"
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
                    <span>{barber.location.address}</span>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                <p className="text-gray-600">{barber.phone}</p>
                <p className="text-gray-600">{barber.email}</p>
              </div>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h2>

              {/* Services Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Services</h3>
                <div className="space-y-3">
                  {services.map((service) => (
                    <label
                      key={service._id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedServices.includes(service._id)
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service._id)}
                        onChange={() => handleServiceToggle(service._id)}
                        className="mr-4 w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{service.name}</span>
                          <span className="text-blue-600 font-semibold">${service.price}</span>
                        </div>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{service.duration} minutes</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Date</h3>
                <div className="grid grid-cols-7 gap-2">
                  {getAvailableDates().map((date) => {
                    const dateObj = new Date(date);
                    const isSelected = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-xs">{dateObj.toLocaleDateString("en-US", { weekday: "short" })}</div>
                        <div className="text-lg font-semibold">{dateObj.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Select Time</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {availability
                      .filter((slot) => slot.isAvailable)
                      .map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTimeSlot(slot.startTime)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            selectedTimeSlot === slot.startTime
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                  </div>
                  {availability.filter((slot) => slot.isAvailable).length === 0 && (
                    <p className="text-gray-500">No available time slots for this date</p>
                  )}
                </div>
              )}

              {/* Summary */}
              {selectedServices.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Services:</span>
                      <span className="font-medium">{selectedServices.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Time:</span>
                      <span className="font-medium">{calculateTotalTime()} minutes</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total Price:</span>
                      <span className="text-blue-600">${calculateTotalPrice()}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
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

