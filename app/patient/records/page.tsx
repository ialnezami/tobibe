"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function PatientRecordsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Medical Records
        </h1>
        <p className="text-slate-600">Your complete medical history and records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment History */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Appointment History
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            View your complete appointment history with all doctors
          </p>
          <Link href="/patient/appointments">
            <Button variant="primary" className="w-full">
              View All Appointments
            </Button>
          </Link>
        </Card>

        {/* Prescriptions */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Prescriptions
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Manage your prescriptions and medication history
          </p>
          <Link href="/patient/prescriptions">
            <Button variant="primary" className="w-full">
              View Prescriptions
            </Button>
          </Link>
        </Card>

        {/* Health Metrics */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Health Metrics
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Track your vital signs and health measurements over time
          </p>
          <Button variant="outline" className="w-full" disabled>
            Coming Soon
          </Button>
        </Card>

        {/* Medical Documents */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Medical Documents
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Store and access your medical documents, lab results, and test reports
          </p>
          <Button variant="outline" className="w-full" disabled>
            Coming Soon
          </Button>
        </Card>
      </div>
    </div>
  );
}


