"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location?: { address: string };
  bookingCount: number;
  serviceCount: number;
  revenue: number;
  createdAt: string;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDoctors();
  }, [search, page]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/doctors?${params}`);
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Doctor Management
        </h1>
        <p className="text-slate-600">Manage all doctors in the system</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <Input
          label="Search Doctors"
          type="text"
          placeholder="Search by name, email, phone, or location..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Card>

      {/* Doctors Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
              <p className="text-slate-600 text-sm">Loading doctors...</p>
            </div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No doctors found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Location
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Bookings
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Services
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Revenue
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr
                      key={doctor._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-900">
                          {doctor.name}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600">{doctor.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600">
                          {doctor.location?.address || "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600">
                          {doctor.bookingCount || 0}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600">
                          {doctor.serviceCount || 0}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-900">
                          ${((doctor.revenue || 0) / 100).toFixed(2)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/doctors/${doctor._id}`}>
                          <Button variant="outline" className="text-xs px-2 py-1">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

