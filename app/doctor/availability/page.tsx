"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

const defaultHours: DayHours = {
  open: "09:00",
  close: "17:00",
  isOpen: true,
};

export default function DoctorAvailabilityPage() {
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { ...defaultHours },
    tuesday: { ...defaultHours },
    wednesday: { ...defaultHours },
    thursday: { ...defaultHours },
    friday: { ...defaultHours },
    saturday: { ...defaultHours },
    sunday: { ...defaultHours, isOpen: false },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch("/api/doctor/availability");
      const data = await response.json();
      if (response.ok && data.workingHours) {
        // Convert Map to object if needed
        const hours = data.workingHours;
        const hoursObj: any = {};
        Object.keys(workingHours).forEach((day) => {
          hoursObj[day] = hours[day] || { ...defaultHours };
        });
        setWorkingHours(hoursObj);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day: keyof WorkingHours, field: keyof DayHours, value: string | boolean) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/doctor/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workingHours }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Working hours updated successfully!");
      } else {
        alert(data.error || "Failed to update working hours");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      alert("Failed to update working hours");
    } finally {
      setSaving(false);
    }
  };

  const days = [
    { key: "monday" as keyof WorkingHours, label: "Monday" },
    { key: "tuesday" as keyof WorkingHours, label: "Tuesday" },
    { key: "wednesday" as keyof WorkingHours, label: "Wednesday" },
    { key: "thursday" as keyof WorkingHours, label: "Thursday" },
    { key: "friday" as keyof WorkingHours, label: "Friday" },
    { key: "saturday" as keyof WorkingHours, label: "Saturday" },
    { key: "sunday" as keyof WorkingHours, label: "Sunday" },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">Loading availability...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Availability Management
        </h1>
        <p className="text-slate-600">Set your working hours for each day of the week</p>
      </div>

      <Card>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          {days.map((day) => (
            <div
              key={day.key}
              className="p-4 border border-slate-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={workingHours[day.key].isOpen}
                    onChange={(e) => handleDayChange(day.key, "isOpen", e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-slate-900">{day.label}</span>
                </label>
              </div>

              {workingHours[day.key].isOpen && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Open Time
                    </label>
                    <Input
                      type="time"
                      value={workingHours[day.key].open}
                      onChange={(e) => handleDayChange(day.key, "open", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Close Time
                    </label>
                    <Input
                      type="time"
                      value={workingHours[day.key].close}
                      onChange={(e) => handleDayChange(day.key, "close", e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Working Hours
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const resetHours: WorkingHours = {
                  monday: { ...defaultHours },
                  tuesday: { ...defaultHours },
                  wednesday: { ...defaultHours },
                  thursday: { ...defaultHours },
                  friday: { ...defaultHours },
                  saturday: { ...defaultHours },
                  sunday: { ...defaultHours, isOpen: false },
                };
                setWorkingHours(resetHours);
              }}
            >
              Reset to Defaults
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


