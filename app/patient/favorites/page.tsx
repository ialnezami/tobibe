"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FavoriteDoctor {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location?: { address: string };
    description?: string;
  };
  notes?: string;
  preferredTime?: string;
  createdAt: string;
}

export default function PatientFavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/patient/favorites");
      const data = await response.json();
      if (response.ok) {
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (doctorId: string) => {
    if (!confirm("Remove this doctor from your favorites?")) {
      return;
    }

    try {
      const response = await fetch(`/api/patient/favorites?doctorId=${doctorId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        fetchFavorites();
      } else {
        alert(data.error || "Failed to remove favorite");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite");
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">Loading favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Favorite Doctors
        </h1>
        <p className="text-slate-600">Your saved doctors for quick access</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <p className="text-slate-600 mb-4">No favorite doctors yet</p>
            <p className="text-sm text-slate-500 mb-6">
              Start adding doctors to your favorites for quick booking
            </p>
            <Link href="/">
              <Button variant="primary">Browse Doctors</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {favorite.doctorId.name}
                  </h3>
                  {favorite.doctorId.location?.address && (
                    <p className="text-sm text-slate-600 mb-2">
                      📍 {favorite.doctorId.location.address}
                    </p>
                  )}
                  {favorite.doctorId.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {favorite.doctorId.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveFavorite(favorite.doctorId._id)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove favorite"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {favorite.notes && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium text-slate-700 mb-1">Notes:</p>
                  <p className="text-sm text-slate-600">{favorite.notes}</p>
                </div>
              )}

              {favorite.preferredTime && (
                <p className="text-xs text-slate-500 mb-4">
                  Preferred time: {favorite.preferredTime}
                </p>
              )}

              <div className="flex gap-2">
                <Link href={`/doctors/${favorite.doctorId._id}`} className="flex-1">
                  <Button variant="primary" className="w-full">
                    Book Appointment
                  </Button>
                </Link>
                <Link href={`/doctors/${favorite.doctorId._id}`}>
                  <Button variant="outline">View Profile</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


