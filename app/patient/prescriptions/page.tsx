"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PatientPrescriptionsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Prescriptions
        </h1>
        <p className="text-slate-600">Manage your medications and prescriptions</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💊</div>
          <p className="text-slate-600 mb-4">Prescription management coming soon</p>
          <p className="text-sm text-slate-500 mb-6">
            This feature will allow you to view your prescriptions, request refills, and track your medications.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" disabled>
              View Prescriptions
            </Button>
            <Button variant="outline" disabled>
              Request Refill
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

