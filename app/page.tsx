"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Barber {
  _id: string;
  name: string;
  description?: string;
  location?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  photos?: string[];
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const response = await fetch("/api/barbers");
      const data = await response.json();
      setBarbers(data.barbers || []);
    } catch (error) {
      console.error("Error fetching barbers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBarbers = barbers.filter((barber) =>
    barber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    barber.location?.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    barber.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading barbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Barber Booking</h1>
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <Link href="/my-bookings">
                    <Button variant="outline">My Bookings</Button>
                  </Link>
                  {session.user.role === "barber" && (
                    <Link href="/barber/dashboard">
                      <Button variant="primary">Dashboard</Button>
                    </Link>
                  )}
                  <Link href="/api/auth/signout">
                    <Button variant="secondary">Logout</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and View Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md w-full">
            <input
              type="text"
              placeholder="Search barbers by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Map View
            </button>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-4">
          Found {filteredBarbers.length} barber{filteredBarbers.length !== 1 ? "s" : ""}
        </p>

        {viewMode === "list" ? (
          <BarberListView barbers={filteredBarbers} />
        ) : (
          <BarberMapView barbers={filteredBarbers} />
        )}
      </main>
    </div>
  );
}

function BarberListView({ barbers }: { barbers: Barber[] }) {
  const router = useRouter();

  if (barbers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No barbers found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {barbers.map((barber) => (
        <Card
          key={barber._id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(`/barbers/${barber._id}`)}
        >
          <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-white text-4xl font-bold">
              {barber.name.charAt(0)}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{barber.name}</h3>
          {barber.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {barber.description}
            </p>
          )}
          {barber.location?.address && (
            <div className="flex items-center text-gray-500 text-sm mb-4">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{barber.location.address}</span>
            </div>
          )}
          <Button
            variant="primary"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/barbers/${barber._id}`);
            }}
          >
            View Details & Book
          </Button>
        </Card>
      ))}
    </div>
  );
}

function BarberMapView({ barbers }: { barbers: Barber[] }) {
  const router = useRouter();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (barbers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No barbers found</p>
      </div>
    );
  }

  // Calculate center of all barbers
  const center = barbers.reduce(
    (acc, barber) => {
      if (barber.location?.coordinates) {
        acc.lat += barber.location.coordinates.lat;
        acc.lng += barber.location.coordinates.lng;
        acc.count++;
      }
      return acc;
    },
    { lat: 0, lng: 0, count: 0 }
  );

  const mapCenter = center.count > 0
    ? { lat: center.lat / center.count, lng: center.lng / center.count }
    : { lat: 40.7128, lng: -74.0060 }; // Default to NYC

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <div className="h-[600px] relative">
          {googleMapsApiKey ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/view?key=${googleMapsApiKey}&center=${mapCenter.lat},${mapCenter.lng}&zoom=12`}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center p-8">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                <p className="text-gray-600 mb-2">Map View</p>
                <p className="text-sm text-gray-500">
                  Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map
                </p>
                <div className="mt-4 space-y-2">
                  {barbers.map((barber) => (
                    <div
                      key={barber._id}
                      className="p-3 bg-white rounded border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/barbers/${barber._id}`)}
                    >
                      <h4 className="font-semibold text-gray-900">{barber.name}</h4>
                      {barber.location?.address && (
                        <p className="text-sm text-gray-600">{barber.location.address}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* List of barbers below map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map((barber) => (
          <Card
            key={barber._id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/barbers/${barber._id}`)}
          >
            <h4 className="font-bold text-gray-900 mb-2">{barber.name}</h4>
            {barber.location?.address && (
              <p className="text-sm text-gray-600 mb-3">{barber.location.address}</p>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/barbers/${barber._id}`);
              }}
            >
              Book Appointment
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
