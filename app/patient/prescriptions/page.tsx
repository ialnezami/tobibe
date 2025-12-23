"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

interface RefillRequest {
  _id: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  respondedAt?: string;
}

interface Prescription {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  patientId: {
    _id: string;
    name: string;
  };
  bookingId?: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  medications: Medication[];
  diagnosis?: string;
  notes?: string;
  prescribedDate: string;
  expiryDate?: string;
  refillRequests: RefillRequest[];
  isActive: boolean;
  createdAt: string;
}

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active">("all");
  const [showRefillModal, setShowRefillModal] = useState<string | null>(null);
  const [refillNotes, setRefillNotes] = useState("");

  useEffect(() => {
    fetchPrescriptions();
  }, [filter]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?filter=${filter}` : "";
      const response = await fetch(`/api/prescriptions${params}`);
      const data = await response.json();
      if (response.ok) {
        setPrescriptions(data.prescriptions || []);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefill = async (prescriptionId: string) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/refill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: refillNotes }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Refill request submitted successfully!");
        setShowRefillModal(null);
        setRefillNotes("");
        fetchPrescriptions();
      } else {
        alert(data.error || "Failed to request refill");
      }
    } catch (error) {
      console.error("Error requesting refill:", error);
      alert("Failed to request refill");
    }
  };

  const getRefillStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const hasPendingRefill = (prescription: Prescription) => {
    return prescription.refillRequests.some((req) => req.status === "pending");
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">Loading prescriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Prescriptions
        </h1>
        <p className="text-slate-600">View your prescriptions and request refills</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium ${
            filter === "all"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 text-sm font-medium ${
            filter === "active"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Active
        </button>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💊</div>
            <p className="text-slate-600 mb-2">No prescriptions found</p>
            <p className="text-sm text-slate-500">
              {filter === "active"
                ? "You don't have any active prescriptions"
                : "Your prescriptions will appear here"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((prescription) => (
            <Card key={prescription._id} className={!prescription.isActive ? "opacity-60" : ""}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Prescribed by {prescription.doctorId.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>
                      📅 {new Date(prescription.prescribedDate).toLocaleDateString()}
                    </span>
                    {prescription.bookingId && (
                      <Link
                        href={`/bookings/${prescription.bookingId._id}`}
                        className="text-teal-600 hover:text-teal-700"
                      >
                        View Appointment
                      </Link>
                    )}
                    {prescription.expiryDate && (
                      <span>
                        Expires: {new Date(prescription.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {prescription.isActive ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {prescription.diagnosis && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Diagnosis:</p>
                  <p className="text-sm text-blue-800">{prescription.diagnosis}</p>
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Medications:</h4>
                <div className="space-y-3">
                  {prescription.medications.map((med, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-900">{med.name}</p>
                          <p className="text-sm text-slate-600">
                            {med.dosage} • {med.frequency}
                            {med.duration && ` • ${med.duration}`}
                          </p>
                        </div>
                      </div>
                      {med.instructions && (
                        <p className="text-sm text-slate-600 mt-2">
                          <span className="font-medium">Instructions:</span> {med.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {prescription.notes && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 mb-1">Notes:</p>
                  <p className="text-sm text-slate-600">{prescription.notes}</p>
                </div>
              )}

              {/* Refill Requests */}
              {prescription.refillRequests.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Refill Requests:</h4>
                  <div className="space-y-2">
                    {prescription.refillRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded"
                      >
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRefillStatusColor(
                            request.status
                          )}`}>
                            {request.status}
                          </span>
                          <span className="text-xs text-slate-600 ml-2">
                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                          {request.respondedAt && (
                            <span className="text-xs text-slate-600 ml-2">
                              • Responded: {new Date(request.respondedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {prescription.isActive && !hasPendingRefill(prescription) && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRefillModal(prescription._id)}
                  >
                    Request Refill
                  </Button>
                )}
                {hasPendingRefill(prescription) && (
                  <span className="px-3 py-2 text-sm text-yellow-700 bg-yellow-50 rounded-lg">
                    Refill request pending
                  </span>
                )}
                <Link href={`/doctors/${prescription.doctorId._id}`}>
                  <Button variant="outline">Contact Doctor</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Refill Request Modal */}
      {showRefillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Request Refill</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={refillNotes}
                onChange={(e) => setRefillNotes(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
                rows={3}
                placeholder="Any additional information for your doctor..."
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => handleRequestRefill(showRefillModal)}
                className="flex-1"
              >
                Submit Request
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRefillModal(null);
                  setRefillNotes("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
