"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/context";

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("en");

  useEffect(() => {
    fetchDefaultLanguage();
  }, []);

  const fetchDefaultLanguage = async () => {
    try {
      const response = await fetch("/api/admin/settings/default-language");
      const data = await response.json();
      if (response.ok) {
        setDefaultLanguage(data.defaultLanguage || "en");
      }
    } catch (error) {
      console.error("Error fetching default language:", error);
    }
  };

  const handleSaveLanguage = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/default-language", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultLanguage }),
      });

      if (response.ok) {
        alert(t("common.success") + ": " + t("language.defaultLanguage") + " updated!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving default language:", error);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
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
        {/* Language Settings */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            🌐 {t("language.defaultLanguage")}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("language.select")}
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-base bg-white"
              >
                <option value="en">🇬🇧 {t("language.english")}</option>
                <option value="ar">🇸🇦 {t("language.arabic")}</option>
                <option value="fr">🇫🇷 {t("language.french")}</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                This will be the default language for new users
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleSaveLanguage}
              isLoading={saving}
            >
              {t("common.save")} {t("language.defaultLanguage")}
            </Button>
          </div>
        </Card>

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


