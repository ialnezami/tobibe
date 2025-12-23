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
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(editingService ? "Service updated successfully" : "Service created successfully");
        setShowAddForm(false);
        setEditingService(null);
        setFormData({ name: "", description: "", price: "", duration: "" });
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
          <p className="text-slate-600">Manage your services and pricing</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingService(null);
            setFormData({ name: "", description: "", price: "", duration: "" });
          }}
        >
          {showAddForm ? "Cancel" : "+ Add Service"}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingService ? "Edit Service" : "Add New Service"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Service Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Input
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
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
            <p className="text-slate-600 mb-4">No services yet</p>
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              Add Your First Service
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

