"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implement settings save
    setTimeout(() => {
      alert("Settings saved successfully!");
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          System Settings
        </h1>
        <p className="text-slate-600">Configure system-wide settings</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            General Settings
          </h2>
          <div className="space-y-4">
            <Input label="Site Name" type="text" defaultValue="Doctor Booking App" />
            <Input label="Site Email" type="email" defaultValue="noreply@doctorbooking.com" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Timezone
              </label>
              <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-base bg-white">
                <option>UTC</option>
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>Europe/London</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Email Settings */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Email Configuration
          </h2>
          <div className="space-y-4">
            <Input label="SMTP Host" type="text" defaultValue="smtp.gmail.com" />
            <Input label="SMTP Port" type="number" defaultValue="587" />
            <Input label="SMTP User" type="email" />
            <Input label="SMTP Password" type="password" />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="smtp-secure" className="rounded" />
              <label htmlFor="smtp-secure" className="text-sm text-slate-700">
                Use secure connection (TLS)
              </label>
            </div>
          </div>
        </Card>

        {/* Payment Settings */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Payment Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="cash-enabled" className="rounded" defaultChecked />
              <label htmlFor="cash-enabled" className="text-sm text-slate-700">
                Enable cash payments
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="online-enabled" className="rounded" />
              <label htmlFor="online-enabled" className="text-sm text-slate-700">
                Enable online payments
              </label>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSave} isLoading={saving}>
            Save Settings
          </Button>
          <Button variant="outline">Reset to Defaults</Button>
        </div>
      </div>
    </div>
  );
}


