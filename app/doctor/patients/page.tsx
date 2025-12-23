"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
  lastVisit: string | null;
  totalSpent: number;
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await fetch(`/api/doctor/patients?${params}`);
      const data = await response.json();
      if (response.ok) {
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          👥 My Patients
        </h1>
        <p className="text-slate-600">Manage your patients and their booking history</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <Input
          label="Search Patients"
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Patients List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
              <p className="text-slate-600 text-sm">Loading patients...</p>
            </div>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-slate-600 mb-2">No patients found</p>
            <p className="text-sm text-slate-500">Patients will appear here after they book appointments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Patient Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Bookings
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Last Visit
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Total Spent
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient._id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-slate-900">
                        {patient.name}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-600">{patient.email}</p>
                      <p className="text-xs text-slate-500">{patient.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-600">
                        {patient.bookingCount || 0}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-600">
                        {patient.lastVisit
                          ? new Date(patient.lastVisit).toLocaleDateString()
                          : "Never"}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-slate-900">
                        ${((patient.totalSpent || 0) / 100).toFixed(2)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/doctor/patients/${patient._id}`}>
                        <Button variant="outline" className="text-xs px-2 py-1">
                          👁️ View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}


