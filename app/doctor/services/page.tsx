"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  isActive: boolean;
  bookingCount: number;
  revenue: number;
  createdAt: string;
}

export default function DoctorServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    isPriceVisible: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/doctor/services");
      const data = await response.json();
      if (response.ok) {
        setServices(data.services || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingService
        ? `/api/doctor/services/${editingService._id}`
        : "/api/doctor/services";
      const method = editingService ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price, // API will handle conversion to cents
          duration: formData.duration,
          isPriceVisible: formData.isPriceVisible,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(editingService ? "Service updated successfully" : "Service created successfully");
        setShowAddForm(false);
        setEditingService(null);
        setFormData({ name: "", description: "", price: "", duration: "", isPriceVisible: true });
        fetchServices();
      } else {
        alert(data.error || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service");
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: (service.price / 100).toFixed(2),
      duration: service.duration.toString(),
      isPriceVisible: (service as any).isPriceVisible !== false,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (serviceId: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/doctor/services/${serviceId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        alert("Service deleted successfully");
        fetchServices();
      } else {
        alert(data.error || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service");
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const response = await fetch(`/api/doctor/services/${service._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });

      if (response.ok) {
        fetchServices();
      }
    } catch (error) {
      console.error("Error toggling service:", error);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
            Service Management
          </h1>
          <p className="text-slate-600">
            Create and manage your custom services. Patients can book these services when scheduling appointments.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingService(null);
            setFormData({ name: "", description: "", price: "", duration: "", isPriceVisible: true });
          }}
        >
          {showAddForm ? "Cancel" : "+ Create Custom Service"}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingService ? "Edit Service" : "Add New Service"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Service Name *"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., General Consultation, Follow-up Visit, Specialized Treatment"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Choose a clear, descriptive name for your service</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
                rows={3}
                placeholder="Describe what this service includes, what patients can expect, etc."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Price ($) *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Set the price for this service</p>
              </div>
              <div>
                <Input
                  label="Duration (minutes) *"
                  type="number"
                  min="5"
                  step="5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">How long does this service take?</p>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPriceVisible}
                  onChange={(e) => setFormData({ ...formData, isPriceVisible: e.target.checked })}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-slate-700">Show price to patients</span>
              </label>
              <p className="text-xs text-slate-500 mt-1 ml-6">
                Uncheck to hide the price from patients (they can still book the service)
              </p>
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary">
                {editingService ? "Update Service" : "Create Service"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingService(null);
                  setFormData({ name: "", description: "", price: "", duration: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Services List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
              <p className="text-slate-600 text-sm">Loading services...</p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🩺</div>
            <p className="text-slate-600 mb-2 text-lg font-medium">No services yet</p>
            <p className="text-slate-500 text-sm mb-6">
              Create custom services that patients can book. You can add services like consultations, checkups, or any specialized treatments.
            </p>
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              Create Your First Service
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Service Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Bookings
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Revenue
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service._id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-slate-900">{service.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-600">
                        {service.description || "—"}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-slate-900">
                        ${(service.price / 100).toFixed(2)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-600">{service.duration} min</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-600">{service.bookingCount || 0}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-slate-900">
                        ${((service.revenue || 0) / 100).toFixed(2)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          service.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1"
                          onClick={() => handleEdit(service)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleDelete(service._id, service.name)}
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
        )}
      </Card>
    </div>
  );
}


