"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface HealthMetric {
  _id: string;
  metricType: string;
  value: number;
  unit: string;
  secondaryValue?: number;
  notes?: string;
  recordedDate: string;
  doctorId?: { name: string };
  createdAt: string;
}

export default function PatientHealthMetricsPage() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    metricType: "blood_pressure",
    value: "",
    secondaryValue: "",
    unit: "",
    notes: "",
    recordedDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchMetrics();
  }, [filter]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?type=${filter}` : "";
      const response = await fetch(`/api/patient/health-metrics${params}`);
      const data = await response.json();
      if (response.ok) {
        setMetrics(data.metrics || []);
      }
    } catch (error) {
      console.error("Error fetching health metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        metricType: formData.metricType,
        value: parseFloat(formData.value),
        unit: formData.unit || getDefaultUnit(formData.metricType),
        recordedDate: formData.recordedDate,
        notes: formData.notes || undefined,
      };

      // Add secondary value for blood pressure
      if (formData.metricType === "blood_pressure" && formData.secondaryValue) {
        payload.secondaryValue = parseFloat(formData.secondaryValue);
      }

      const response = await fetch("/api/patient/health-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Health metric recorded successfully!");
        setShowAddForm(false);
        setFormData({
          metricType: "blood_pressure",
          value: "",
          secondaryValue: "",
          unit: "",
          notes: "",
          recordedDate: new Date().toISOString().split("T")[0],
        });
        fetchMetrics();
      } else {
        alert(data.error || "Failed to record metric");
      }
    } catch (error) {
      console.error("Error recording metric:", error);
      alert("Failed to record metric");
    }
  };

  const handleDelete = async (metricId: string) => {
    if (!confirm("Are you sure you want to delete this metric?")) return;

    try {
      const response = await fetch(`/api/patient/health-metrics/${metricId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMetrics();
      } else {
        alert("Failed to delete metric");
      }
    } catch (error) {
      console.error("Error deleting metric:", error);
      alert("Failed to delete metric");
    }
  };

  const getDefaultUnit = (type: string) => {
    const units: { [key: string]: string } = {
      blood_pressure: "mmHg",
      heart_rate: "bpm",
      weight: "kg",
      height: "cm",
      bmi: "",
      blood_sugar: "mg/dL",
      temperature: "°C",
      oxygen_saturation: "%",
      cholesterol: "mg/dL",
    };
    return units[type] || "";
  };

  const getMetricLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      blood_pressure: "Blood Pressure",
      heart_rate: "Heart Rate",
      weight: "Weight",
      height: "Height",
      bmi: "BMI",
      blood_sugar: "Blood Sugar",
      temperature: "Temperature",
      oxygen_saturation: "Oxygen Saturation",
      cholesterol: "Cholesterol",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getMetricIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      blood_pressure: "🩺",
      heart_rate: "❤️",
      weight: "⚖️",
      height: "📏",
      bmi: "📊",
      blood_sugar: "🩸",
      temperature: "🌡️",
      oxygen_saturation: "💨",
      cholesterol: "🧪",
      other: "📋",
    };
    return icons[type] || "📋";
  };

  const metricTypes = [
    "blood_pressure",
    "heart_rate",
    "weight",
    "height",
    "bmi",
    "blood_sugar",
    "temperature",
    "oxygen_saturation",
    "cholesterol",
    "other",
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">Loading health metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
            Health Metrics
          </h1>
          <p className="text-slate-600">Track your vital signs and health measurements over time</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Record Metric"}
        </Button>
      </div>

      {/* Add Metric Form */}
      {showAddForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Record Health Metric</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Metric Type *
                </label>
                <select
                  required
                  value={formData.metricType}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      metricType: e.target.value,
                      unit: getDefaultUnit(e.target.value),
                    });
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
                >
                  {metricTypes.map((type) => (
                    <option key={type} value={type}>
                      {getMetricLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Recorded Date *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.recordedDate}
                  onChange={(e) => setFormData({ ...formData, recordedDate: e.target.value })}
                />
              </div>
            </div>

            {formData.metricType === "blood_pressure" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Systolic (mmHg) *
                  </label>
                  <Input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diastolic (mmHg) *
                  </label>
                  <Input
                    type="number"
                    required
                    value={formData.secondaryValue}
                    onChange={(e) => setFormData({ ...formData, secondaryValue: e.target.value })}
                    placeholder="80"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Value *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Enter value"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder={getDefaultUnit(formData.metricType)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
                rows={3}
                placeholder="Additional notes or observations"
              />
            </div>

            <Button type="submit" variant="primary">
              Record Metric
            </Button>
          </form>
        </Card>
      )}

      {/* Filter */}
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
        {metricTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 text-sm font-medium ${
              filter === type
                ? "border-b-2 border-teal-600 text-teal-700"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {getMetricLabel(type)}
          </button>
        ))}
      </div>

      {/* Metrics List */}
      {metrics.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-slate-600 mb-2">No health metrics recorded yet</p>
            <p className="text-sm text-slate-500 mb-6">
              Start tracking your vital signs and health measurements
            </p>
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              Record Your First Metric
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {metrics.map((metric) => (
            <Card key={metric._id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getMetricIcon(metric.metricType)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {getMetricLabel(metric.metricType)}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {new Date(metric.recordedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-11">
                    {metric.metricType === "blood_pressure" ? (
                      <p className="text-2xl font-bold text-teal-700">
                        {metric.value}/{metric.secondaryValue} {metric.unit}
                      </p>
                    ) : (
                      <p className="text-2xl font-bold text-teal-700">
                        {metric.value} {metric.unit}
                      </p>
                    )}
                    {metric.notes && (
                      <p className="text-sm text-slate-600 mt-2">{metric.notes}</p>
                    )}
                    {metric.doctorId && (
                      <p className="text-xs text-slate-500 mt-2">
                        Recorded by: {metric.doctorId.name}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="text-xs"
                  onClick={() => handleDelete(metric._id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


