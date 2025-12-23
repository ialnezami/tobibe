"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Doctor {
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

type ViewMode = "grid" | "list" | "map";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
    if (session?.user?.role === "customer") {
      fetchFavorites();
    }
  }, [session]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/patient/favorites");
      const data = await response.json();
      if (response.ok && data.favorites) {
        const ids = new Set(
          data.favorites.map((fav: any) =>
            typeof fav.doctorId === "object" ? fav.doctorId._id : fav.doctorId
          )
        );
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleToggleFavorite = async (doctorId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!session?.user || session.user.role !== "customer") {
      router.push("/login");
      return;
    }

    setTogglingFavorite(doctorId);
    try {
      const isFavorite = favoriteIds.has(doctorId);
      if (isFavorite) {
        const response = await fetch(`/api/patient/favorites?doctorId=${doctorId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setFavoriteIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(doctorId);
            return newSet;
          });
        }
      } else {
        const response = await fetch("/api/patient/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorId }),
        });
        if (response.ok) {
          setFavoriteIds((prev) => new Set([...prev, doctorId]));
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite");
    } finally {
      setTogglingFavorite(null);
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.location?.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const doctorsWithLocation = filteredDoctors.filter((d) => d.location?.coordinates);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/30 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm font-medium">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Find Your Perfect Doctor
            </h1>
            <p className="text-lg sm:text-xl text-teal-50 mb-8 leading-relaxed">
              Book appointments with trusted healthcare professionals. Fast, easy, and convenient.
            </p>
            {!session && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button variant="secondary" className="px-8 py-3 text-base font-semibold">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="px-8 py-3 text-base font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Header Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Browse Doctors</h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {session ? (
                <>
                  {session.user.role === "customer" && (
                    <Link href="/patient/dashboard">
                      <Button variant="outline" className="text-sm px-4 py-2 hidden sm:inline-flex">
                        My Health
                      </Button>
                    </Link>
                  )}
                  {session.user.role === "doctor" && (
                    <Link href="/doctor/dashboard">
                      <Button variant="primary" className="text-sm px-4 py-2 hidden sm:inline-flex">
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  {session.user.role === "admin" && (
                    <Link href="/admin/dashboard">
                      <Button variant="primary" className="text-sm px-4 py-2 hidden sm:inline-flex bg-teal-800 hover:bg-teal-900">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link href="/api/auth/signout">
                    <Button variant="secondary" className="text-sm px-4 py-2">
                      Logout
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="text-sm px-4 py-2">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" className="text-sm px-4 py-2">
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
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-10">
        {/* Search and View Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, location, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3.5 pl-12 pr-4 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-base bg-white shadow-sm transition-all hover:border-slate-400"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
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

          {/* View Mode Toggle and Results Count */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                {filteredDoctors.length === 0
                  ? "No doctors found"
                  : `${filteredDoctors.length} doctor${filteredDoctors.length !== 1 ? "s" : ""} available`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Buttons */}
              <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-teal-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  aria-label="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-teal-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  aria-label="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {doctorsWithLocation.length > 0 && (
                  <button
                    onClick={() => setViewMode("map")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "map"
                        ? "bg-teal-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    aria-label="Map view"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Map View */}
        {viewMode === "map" && doctorsWithLocation.length > 0 && (
          <div className="mb-6">
            <Card className="p-0 overflow-hidden">
              <div className="h-[500px] sm:h-[600px]">
                <Map
                  doctors={filteredDoctors}
                  onMarkerClick={(doctor) => router.push(`/doctors/${doctor._id}`)}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Doctor List/Grid View */}
        {viewMode !== "map" && (
          <>
            {filteredDoctors.length === 0 ? (
              <Card className="text-center py-16">
                <svg
                  className="w-20 h-20 text-slate-300 mx-auto mb-6"
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
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No doctors found</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? "Try adjusting your search terms or browse all doctors"
                    : "No doctors are available at the moment. Check back later or seed the database."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                      className="px-6"
                    >
                      Clear Search
                    </Button>
                  )}
                  <Link href="/seed">
                    <Button variant="primary" className="px-6">
                      Seed Database
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : viewMode === "list" ? (
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => {
                  const isFavorite = favoriteIds.has(doctor._id);
                  return (
                    <Card
                      key={doctor._id}
                      className="hover:shadow-lg hover:border-teal-300 transition-all duration-200 cursor-pointer border-2 border-slate-200 bg-white relative"
                      onClick={() => router.push(`/doctors/${doctor._id}`)}
                    >
                      {/* Favorite Star Button */}
                      {session?.user?.role === "customer" && (
                        <button
                          onClick={(e) => handleToggleFavorite(doctor._id, e)}
                          disabled={togglingFavorite === doctor._id}
                          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all hover:scale-110 disabled:opacity-50"
                          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          {togglingFavorite === doctor._id ? (
                            <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg
                              className={`w-5 h-5 transition-colors ${
                                isFavorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-none text-slate-400 hover:text-yellow-400"
                              }`}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          )}
                        </button>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Doctor Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-white text-3xl sm:text-4xl font-bold">
                              {doctor.name.charAt(0)}
                            </span>
                          </div>
                        </div>

                        {/* Doctor Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
                            {doctor.name}
                          </h3>
                        {doctor.description && (
                          <p className="text-slate-600 text-sm sm:text-base mb-3 line-clamp-2">
                            {doctor.description}
                          </p>
                        )}
                        {doctor.location?.address && (
                          <div className="flex items-start text-slate-500 text-sm mb-4">
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
                            <span className="line-clamp-1">{doctor.location.address}</span>
                          </div>
                        )}
                        <Button
                          variant="primary"
                          className="w-full sm:w-auto text-sm py-2.5 px-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/doctors/${doctor._id}`);
                          }}
                        >
                          View Details & Book Appointment
                        </Button>
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredDoctors.map((doctor) => {
                  const isFavorite = favoriteIds.has(doctor._id);
                  return (
                    <Card
                      key={doctor._id}
                      className="hover:shadow-xl hover:border-teal-300 transition-all duration-200 cursor-pointer border-2 border-slate-200 bg-white overflow-hidden group relative"
                      onClick={() => router.push(`/doctors/${doctor._id}`)}
                    >
                      {/* Favorite Star Button */}
                      {session?.user?.role === "customer" && (
                        <button
                          onClick={(e) => handleToggleFavorite(doctor._id, e)}
                          disabled={togglingFavorite === doctor._id}
                          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all hover:scale-110 disabled:opacity-50"
                          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          {togglingFavorite === doctor._id ? (
                            <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg
                              className={`w-5 h-5 transition-colors ${
                                isFavorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-none text-slate-400 hover:text-yellow-400"
                              }`}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          )}
                        </button>
                      )}

                      {/* Doctor Avatar/Image */}
                      <div className="h-48 bg-gradient-to-br from-teal-600 to-teal-700 rounded-t-xl mb-4 -mx-6 -mt-6 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                        <div className="text-white text-6xl sm:text-7xl font-bold">
                          {doctor.name.charAt(0)}
                        </div>
                      </div>

                    {/* Doctor Info */}
                    <div className="px-2">
                      <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 line-clamp-1">
                        {doctor.name}
                      </h3>

                      {doctor.description && (
                        <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed min-h-[60px]">
                          {doctor.description}
                        </p>
                      )}

                      {doctor.location?.address && (
                        <div className="flex items-start text-slate-500 text-xs sm:text-sm mb-4">
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
                          <span className="line-clamp-2">{doctor.location.address}</span>
                        </div>
                      )}

                      <Button
                        variant="primary"
                        className="w-full text-sm py-3 font-semibold group-hover:bg-teal-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/doctors/${doctor._id}`);
                        }}
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {session && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 sm:hidden z-50 shadow-lg">
          <div className="flex items-center justify-around py-2">
            <Link
              href="/"
              className="flex flex-col items-center px-4 py-2 text-teal-600"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs font-medium">Browse</span>
            </Link>
            <Link
              href="/my-bookings"
              className="flex flex-col items-center px-4 py-2 text-slate-600"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">Bookings</span>
            </Link>
            {session.user.role === "customer" && (
              <Link
                href="/patient/dashboard"
                className="flex flex-col items-center px-4 py-2 text-slate-600"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-xs font-medium">Health</span>
              </Link>
            )}
            {session.user.role === "doctor" && (
              <Link
                href="/doctor/dashboard"
                className="flex flex-col items-center px-4 py-2 text-slate-600"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
