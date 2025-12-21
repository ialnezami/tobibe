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

  const filteredBarbers = barbers.filter(
    (barber) =>
      barber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      barber.location?.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      barber.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading barbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Barber Booking</h1>
            <div className="flex items-center gap-2">
              {session ? (
                <>
                  <Link href="/my-bookings">
                    <Button variant="outline" className="text-xs px-2 py-1 hidden sm:inline-flex">
                      My Bookings
                    </Button>
                  </Link>
                  {session.user.role === "barber" && (
                    <Link href="/barber/dashboard">
                      <Button variant="primary" className="text-xs px-2 py-1 hidden sm:inline-flex">
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link href="/api/auth/signout">
                    <Button variant="secondary" className="text-xs px-2 py-1">
                      Logout
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="text-xs px-2 py-1">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" className="text-xs px-2 py-1">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Search Bar - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search barbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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

        {/* Results Count */}
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          {filteredBarbers.length === 0
            ? "No barbers found"
            : `Found ${filteredBarbers.length} barber${filteredBarbers.length !== 1 ? "s" : ""}`}
        </p>

        {/* Barber List - Mobile First Grid */}
        {filteredBarbers.length === 0 ? (
          <div className="text-center py-12">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-gray-500 text-base mb-4">No barbers found</p>
            <p className="text-gray-400 text-sm mb-6">
              Try adjusting your search or check back later
            </p>
            <Link href="/seed">
              <Button variant="outline">Seed Database</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredBarbers.map((barber) => (
              <Card
                key={barber._id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200"
                onClick={() => router.push(`/barbers/${barber._id}`)}
              >
                {/* Barber Avatar/Image - Mobile Optimized */}
                <div className="h-40 sm:h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-t-lg mb-4 -mx-6 -mt-6 flex items-center justify-center">
                  <div className="text-white text-5xl sm:text-6xl font-bold">
                    {barber.name.charAt(0)}
                  </div>
                </div>

                {/* Barber Info */}
                <div className="px-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {barber.name}
                  </h3>
                  
                  {barber.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {barber.description}
                    </p>
                  )}

                  {barber.location?.address && (
                    <div className="flex items-start text-gray-500 text-xs sm:text-sm mb-4">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="line-clamp-2">{barber.location.address}</span>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    className="w-full text-sm py-2.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/barbers/${barber._id}`);
                    }}
                  >
                    View Details & Book
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation - Only show on mobile */}
      {session && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden z-50">
          <div className="flex items-center justify-around py-2">
            <Link
              href="/"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-xs font-medium">Browse</span>
            </Link>
            <Link
              href="/my-bookings"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-medium">Bookings</span>
            </Link>
            {session.user.role === "barber" && (
              <Link
                href="/barber/dashboard"
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
            )}
          </div>
        </nav>
      )}

      {/* Padding for mobile bottom nav */}
      {session && <div className="h-16 sm:hidden"></div>}
    </div>
  );
}
