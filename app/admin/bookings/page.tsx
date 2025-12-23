"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface Booking {
  _id: string;
  customerId: { name: string; email: string; phone: string };
  doctorId: { name: string; email: string };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  payment?: { amount: number; status: string; method: string };
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [search, statusFilter, page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/bookings?${params}`);
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportBookings = () => {
    // Simple CSV export
    const headers = ["Date", "Time", "Customer", "Doctor", "Status", "Amount"];
    const rows = bookings.map((b) => [
      new Date(b.date).toLocaleDateString(),
      `${b.startTime} - ${b.endTime}`,
      b.customerId?.name || "N/A",
      b.doctorId?.name || "N/A",
      b.status,
      b.payment ? `$${(b.payment.amount / 100).toFixed(2)}` : "N/A",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
            Booking Management
          </h1>
          <p className="text-slate-600">View and manage all bookings</p>
        </div>
        <Button variant="primary" onClick={exportBookings}>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Search Bookings"
              type="text"
              placeholder="Search by customer or doctor name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-base bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
              <p className="text-slate-600 text-sm">Loading bookings...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No bookings found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Doctor
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Payment
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-900">
                          {booking.customerId?.name || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {booking.customerId?.email || "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-900">
                          {booking.doctorId?.name || "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {booking.payment ? (
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              ${(booking.payment.amount / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {booking.payment.status} • {booking.payment.method}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">N/A</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/bookings/${booking._id}`}>
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


