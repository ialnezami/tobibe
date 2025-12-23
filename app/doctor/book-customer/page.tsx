"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export default function BookCustomerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"search" | "create" | "book">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    password: "temp123", // Temporary password, customer can change later
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "doctor") {
      router.push("/");
      return;
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchServices();
    }
  }, [status, session, router]);

  useEffect(() => {
    if (selectedDate && session?.user?.id) {
      fetchAvailability();
    }
  }, [selectedDate, session?.user?.id]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/services?doctorId=${session?.user?.id}`);
      const data = await response.json();
      setServices(data.services.filter((s: Service) => s.isActive));
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch(
        `/api/doctors/${session?.user?.id}/availability?date=${selectedDate}`
      );
      const data = await response.json();
      setAvailability(data.availability || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const searchCustomers = async () => {
    if (!searchQuery.trim()) {
      setCustomers([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (response.ok) {
        setCustomers(data.users || []);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCustomers();
      } else {
        setCustomers([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const createCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert("Name and email are required");
      return;
    }

    try {
      setCreatingCustomer(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCustomer,
          role: "customer",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSelectedCustomer(data.user);
        setStep("book");
        setNewCustomer({ name: "", email: "", phone: "", password: "temp123" });
      } else {
        alert(data.error || "Failed to create customer");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Failed to create customer");
    } finally {
      setCreatingCustomer(false);
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
      // Only include price if it's visible
      if (service && (service as any).isPriceVisible !== false) {
        return total + (service.price || 0);
      }
      return total;
    }, 0);
  };

  const hasVisiblePrices = () => {
    return selectedServices.some((serviceId) => {
      const service = services.find((s) => s._id === serviceId);
      return service && (service as any).isPriceVisible !== false;
    });
  };

  const handleBook = async () => {
    if (!selectedCustomer || !selectedDate || !selectedTimeSlot || selectedServices.length === 0) {
      alert("Please select customer, date, time, and at least one service");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          doctorId: session?.user?.id,
          serviceIds: selectedServices,
          date: selectedDate,
          startTime: selectedTimeSlot,
          source: "doctor-assisted",
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
    } finally {
      setLoading(false);
    }
  };

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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-4">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <Link
            href="/doctor/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 text-sm"
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
          Back to Dashboard
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Book for Customer</h1>

        {/* Step 1: Search or Create Customer */}
        {step === "search" && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Find or Create Customer</h2>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for Existing Customer
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {customers.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {customers.map((customer) => (
                    <button
                      key={customer._id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setStep("book");
                      }}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                      {customer.phone && (
                        <div className="text-sm text-gray-600">{customer.phone}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && !loading && customers.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">No customers found</p>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">OR</span>
              </div>
            </div>

            {/* Create New Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create New Customer
              </label>
              <div className="space-y-4">
                <Input
                  label="Name *"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  placeholder="Customer name"
                />
                <Input
                  label="Email *"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  placeholder="customer@example.com"
                />
                <Input
                  label="Phone (Optional)"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={createCustomer}
                  isLoading={creatingCustomer}
                  disabled={!newCustomer.name || !newCustomer.email}
                >
                  Create Customer & Continue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Booking Details */}
        {step === "book" && selectedCustomer && (
          <div className="space-y-6">
            {/* Selected Customer */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Customer</h3>
                  <p className="text-gray-600">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && (
                    <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("search");
                    setSelectedCustomer(null);
                  }}
                >
                  Change
                </Button>
              </div>
            </Card>

            {/* Services Selection */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Services</h2>
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
                        {(service as any).isPriceVisible !== false ? (
                          <span className="text-blue-600 font-semibold">${service.price}</span>
                        ) : (
                          <span className="text-slate-500 italic text-sm">Price on request</span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{service.duration} minutes</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {/* Date Selection */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Date</h2>
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
                      <div className="text-xs">
                        {dateObj.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="text-lg font-semibold">{dateObj.getDate()}</div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Time Slot Selection */}
            {selectedDate && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Select Time</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                  <p className="text-gray-500 text-sm">No available time slots for this date</p>
                )}
              </Card>
            )}

            {/* Summary */}
            {selectedServices.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedCustomer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Services:</span>
                    <span className="font-medium">{selectedServices.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Time:</span>
                    <span className="font-medium">{calculateTotalTime()} minutes</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    {hasVisiblePrices() ? (
                      <>
                        <span>Total Price:</span>
                        <span className="text-blue-600">${calculateTotalPrice()}</span>
                      </>
                    ) : (
                      <>
                        <span>Price:</span>
                        <span className="text-slate-500 italic">Available upon booking</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Book Button */}
            <Button
              variant="primary"
              className="w-full py-3"
              onClick={handleBook}
              isLoading={loading}
              disabled={
                !selectedDate ||
                !selectedTimeSlot ||
                selectedServices.length === 0
              }
            >
              Confirm Booking
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden z-50">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/doctor/dashboard"
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link
            href="/doctor/book-customer"
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


