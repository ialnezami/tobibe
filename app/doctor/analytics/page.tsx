"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DoctorAnalyticsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Analytics & Reports
        </h1>
        <p className="text-slate-600">View insights about your practice</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Booking Analytics
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Bookings over time, peak hours, and popular services
          </p>
          <Button variant="outline" className="w-full" disabled>
            View Analytics
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Patient Analytics
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            New vs returning patients, retention, and average visits
          </p>
          <Button variant="outline" className="w-full" disabled>
            View Analytics
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Performance Metrics
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Completion rates, average appointment value, and revenue trends
          </p>
          <Button variant="outline" className="w-full" disabled>
            View Metrics
          </Button>
        </Card>
      </div>
    </div>
  );
}


