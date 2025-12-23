"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Reminder {
  _id: string;
  type: "appointment" | "medication" | "checkup";
  title: string;
  description?: string;
  reminderDate: string;
  reminderTime: string;
  bookingId?: any;
  medicationName?: string;
  dosage?: string;
  frequency?: "once" | "daily" | "weekly" | "monthly";
  isRecurring: boolean;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: string;
}

interface Booking {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  doctorId: { name: string };
}

export default function PatientRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    bookingId: "",
    reminderDate: "",
    reminderTime: "",
    description: "",
  });

  // Medication form state
  const [medicationForm, setMedicationForm] = useState({
    medicationName: "",
    dosage: "",
    frequency: "once" as "once" | "daily" | "weekly" | "monthly",
    reminderDate: "",
    reminderTime: "",
    description: "",
    isRecurring: false,
  });

  useEffect(() => {
    fetchReminders();
    fetchBookings();
  }, [filter]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?filter=${filter}` : "";
      const response = await fetch(`/api/patient/reminders${params}`);
      const data = await response.json();
      if (response.ok) {
        setReminders(data.reminders || []);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings?filter=upcoming");
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleCreateAppointmentReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/patient/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "appointment",
          title: `Appointment Reminder - ${bookings.find(b => b._id === appointmentForm.bookingId)?.doctorId.name || "Doctor"}`,
          description: appointmentForm.description,
          reminderDate: appointmentForm.reminderDate,
          reminderTime: appointmentForm.reminderTime,
          bookingId: appointmentForm.bookingId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Appointment reminder created successfully!");
        setShowAppointmentForm(false);
        setAppointmentForm({ bookingId: "", reminderDate: "", reminderTime: "", description: "" });
        fetchReminders();
      } else {
        alert(data.error || "Failed to create reminder");
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      alert("Failed to create reminder");
    }
  };

  const handleCreateMedicationReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/patient/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "medication",
          title: `Medication: ${medicationForm.medicationName}`,
          description: medicationForm.description,
          reminderDate: medicationForm.reminderDate,
          reminderTime: medicationForm.reminderTime,
          medicationName: medicationForm.medicationName,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency,
          isRecurring: medicationForm.isRecurring,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Medication reminder created successfully!");
        setShowMedicationForm(false);
        setMedicationForm({
          medicationName: "",
          dosage: "",
          frequency: "once",
          reminderDate: "",
          reminderTime: "",
          description: "",
          isRecurring: false,
        });
        fetchReminders();
      } else {
        alert(data.error || "Failed to create reminder");
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      alert("Failed to create reminder");
    }
  };

  const handleToggleComplete = async (reminderId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/patient/reminders/${reminderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });

      if (response.ok) {
        fetchReminders();
      } else {
        alert("Failed to update reminder");
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
      alert("Failed to update reminder");
    }
  };

  const handleDelete = async (reminderId: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;

    try {
      const response = await fetch(`/api/patient/reminders/${reminderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchReminders();
      } else {
        alert("Failed to delete reminder");
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("Failed to delete reminder");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return "📅";
      case "medication":
        return "💊";
      case "checkup":
        return "🏥";
      default:
        return "🔔";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800";
      case "medication":
        return "bg-purple-100 text-purple-800";
      case "checkup":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">Loading reminders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Health Reminders
        </h1>
        <p className="text-slate-600">Set reminders for appointments and medications</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant="primary"
          onClick={() => {
            setShowAppointmentForm(!showAppointmentForm);
            setShowMedicationForm(false);
          }}
        >
          {showAppointmentForm ? "Cancel" : "Set Appointment Reminder"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setShowMedicationForm(!showMedicationForm);
            setShowAppointmentForm(false);
          }}
        >
          {showMedicationForm ? "Cancel" : "Set Medication Reminder"}
        </Button>
      </div>

      {/* Appointment Reminder Form */}
      {showAppointmentForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Appointment Reminder</h2>
          <form onSubmit={handleCreateAppointmentReminder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Appointment
              </label>
              <select
                required
                value={appointmentForm.bookingId}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, bookingId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
              >
                <option value="">Select an appointment</option>
                {bookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.doctorId.name} - {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reminder Date
                </label>
                <Input
                  type="date"
                  required
                  value={appointmentForm.reminderDate}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, reminderDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reminder Time
                </label>
                <Input
                  type="time"
                  required
                  value={appointmentForm.reminderTime}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, reminderTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={appointmentForm.description}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
                rows={3}
              />
            </div>
            <Button type="submit" variant="primary">
              Create Reminder
            </Button>
          </form>
        </Card>
      )}

      {/* Medication Reminder Form */}
      {showMedicationForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Medication Reminder</h2>
          <form onSubmit={handleCreateMedicationReminder} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Medication Name *
                </label>
                <Input
                  required
                  value={medicationForm.medicationName}
                  onChange={(e) => setMedicationForm({ ...medicationForm, medicationName: e.target.value })}
                  placeholder="e.g., Aspirin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dosage
                </label>
                <Input
                  value={medicationForm.dosage}
                  onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                  placeholder="e.g., 100mg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Frequency
              </label>
              <select
                value={medicationForm.frequency}
                onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value as any })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reminder Date *
                </label>
                <Input
                  type="date"
                  required
                  value={medicationForm.reminderDate}
                  onChange={(e) => setMedicationForm({ ...medicationForm, reminderDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reminder Time *
                </label>
                <Input
                  type="time"
                  required
                  value={medicationForm.reminderTime}
                  onChange={(e) => setMedicationForm({ ...medicationForm, reminderTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={medicationForm.isRecurring}
                  onChange={(e) => setMedicationForm({ ...medicationForm, isRecurring: e.target.checked })}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-slate-700">Recurring reminder</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={medicationForm.description}
                onChange={(e) => setMedicationForm({ ...medicationForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-600"
                rows={3}
                placeholder="Additional instructions or notes"
              />
            </div>
            <Button type="submit" variant="primary">
              Create Reminder
            </Button>
          </form>
        </Card>
      )}

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
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 text-sm font-medium ${
            filter === "completed"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-slate-600 mb-2">No reminders found</p>
            <p className="text-sm text-slate-500">
              {filter === "active"
                ? "Create a reminder to get started"
                : filter === "completed"
                ? "No completed reminders"
                : "Create your first reminder above"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <Card key={reminder._id} className={reminder.isCompleted ? "opacity-60" : ""}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(reminder.type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{reminder.title}</h3>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                          reminder.type
                        )}`}
                      >
                        {reminder.type}
                      </span>
                    </div>
                  </div>
                  {reminder.description && (
                    <p className="text-slate-600 text-sm mb-2">{reminder.description}</p>
                  )}
                  {reminder.type === "medication" && (
                    <div className="text-sm text-slate-600 mb-2">
                      {reminder.medicationName && (
                        <span className="font-medium">Medication: {reminder.medicationName}</span>
                      )}
                      {reminder.dosage && <span className="ml-2">({reminder.dosage})</span>}
                      {reminder.frequency && (
                        <span className="ml-2">• {reminder.frequency}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>
                      📅 {new Date(reminder.reminderDate).toLocaleDateString()} at {reminder.reminderTime}
                    </span>
                    {reminder.isRecurring && (
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                        Recurring
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!reminder.isCompleted && (
                    <Button
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleToggleComplete(reminder._id, reminder.isCompleted)}
                    >
                      Mark Complete
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => handleDelete(reminder._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
