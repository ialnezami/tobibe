"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminReportsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Reports & Analytics
        </h1>
        <p className="text-slate-600">Generate and view system reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Financial Reports
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Revenue by date range, doctor, and payment method
          </p>
          <Button variant="outline" className="w-full">
            Generate Report
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            User Reports
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            User registrations, activity, and retention
          </p>
          <Button variant="outline" className="w-full">
            Generate Report
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Booking Reports
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Booking trends, peak hours, and cancellations
          </p>
          <Button variant="outline" className="w-full">
            Generate Report
          </Button>
        </Card>
      </div>
    </div>
  );
}



