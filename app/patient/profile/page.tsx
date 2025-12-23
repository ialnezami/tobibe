"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function PatientProfilePage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          Health Profile
        </h1>
        <p className="text-slate-600">Manage your health information and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Personal Information
          </h2>
          <div className="space-y-4">
            <Input label="Full Name" type="text" />
            <Input label="Email" type="email" />
            <Input label="Phone" type="tel" />
            <Input label="Address" type="text" />
            <div className="flex gap-3">
              <Button variant="primary">Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </Card>

        {/* Medical Information */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Medical Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Medical History
              </label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-base bg-white"
                rows={4}
                placeholder="Enter your medical history..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Allergies
              </label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-base bg-white"
                rows={2}
                placeholder="List any allergies..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Current Medications
              </label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-base bg-white"
                rows={2}
                placeholder="List current medications..."
              />
            </div>
            <div className="flex gap-3">
              <Button variant="primary">Save Medical Info</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Emergency Contacts
          </h2>
          <div className="space-y-4">
            <Input label="Emergency Contact Name" type="text" />
            <Input label="Emergency Contact Phone" type="tel" />
            <Input label="Relationship" type="text" />
            <div className="flex gap-3">
              <Button variant="primary">Save Contact</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </Card>

        {/* Insurance Information */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Insurance Information
          </h2>
          <div className="space-y-4">
            <Input label="Insurance Provider" type="text" />
            <Input label="Policy Number" type="text" />
            <Input label="Group Number" type="text" />
            <div className="flex gap-3">
              <Button variant="primary">Save Insurance Info</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


