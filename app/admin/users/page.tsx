"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  bookingCount: number;
  createdAt: string;
}

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

type TabType = "users" | "doctors";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchDoctors();
    }
  }, [activeTab, search, roleFilter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        alert("User deleted successfully");
        fetchUsers();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearch("");
    setRoleFilter("all");
    setPage(1);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          User & Doctor Management
        </h1>
        <p className="text-slate-600">Manage all users and doctors in the system</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => handleTabChange("users")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === "users"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => handleTabChange("doctors")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === "doctors"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            👨‍⚕️ Doctors
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label={activeTab === "users" ? "Search Users" : "Search Doctors"}
              type="text"
              placeholder={
                activeTab === "users"
                  ? "Search by name, email, or phone..."
                  : "Search by name, email, phone, or location..."
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {activeTab === "users" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Filter by Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-base bg-white"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Users Table */}
      {activeTab === "users" && (
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
                <p className="text-slate-600 text-sm">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No users found</p>
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
                        Phone
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Bookings
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-slate-900">
                            {user.name}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-slate-600">{user.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-slate-600">{user.phone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : user.role === "doctor"
                                ? "bg-teal-100 text-teal-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-slate-600">
                            {user.bookingCount || 0}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/users/${user._id}`}>
                              <Button variant="outline" className="text-xs px-2 py-1">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:border-red-300"
                              onClick={() => handleDelete(user._id, user.name)}
                            >
                              Delete
                            </Button>
                          </div>
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
      )}

      {/* Doctors Table */}
      {activeTab === "doctors" && (
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
      )}
    </div>
  );
}
