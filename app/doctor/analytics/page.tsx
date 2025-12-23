"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
  bookingsOverTime: Array<{ _id: string; count: number }>;
  peakHours: Array<{ _id: string; count: number }>;
  popularServices: Array<{ serviceId: string; serviceName: string; count: number }>;
}

interface PatientAnalytics {
  totalPatients: number;
  newPatients: number;
  returningPatients: number;
  patientRetention: number;
  averageVisitsPerPatient: number;
}

interface PerformanceMetrics {
  completionRate: number;
  averageAppointmentValue: number;
  totalRevenue: number;
  revenueTrends: Array<{ _id: string; revenue: number }>;
}

interface AnalyticsData {
  period: {
    start: string | null;
    end: string;
    period: string;
  };
  bookingAnalytics: BookingAnalytics;
  patientAnalytics: PatientAnalytics;
  performanceMetrics: PerformanceMetrics;
}

export default function DoctorAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("month");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/doctor/analytics?period=${period}`);
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-slate-600">No analytics data available</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
            Analytics & Reports
          </h1>
          <p className="text-slate-600">View insights about your practice</p>
        </div>
        <div className="flex gap-2">
          {["week", "month", "year", "all"].map((p) => (
            <Button
              key={p}
              variant={period === p ? "primary" : "outline"}
              onClick={() => setPeriod(p)}
              className="text-sm capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Booking Analytics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Booking Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900">
                {analytics.bookingAnalytics.totalBookings}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-700">
                {analytics.bookingAnalytics.completedBookings}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-700">
                {analytics.bookingAnalytics.cancelledBookings}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Cancellation Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {analytics.bookingAnalytics.cancellationRate.toFixed(1)}%
              </p>
            </div>
          </Card>
        </div>

        {/* Peak Hours */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Peak Booking Hours</h3>
          {analytics.bookingAnalytics.peakHours.length > 0 ? (
            <div className="space-y-2">
              {analytics.bookingAnalytics.peakHours.map((hour, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="font-medium text-slate-900">
                    {hour._id}:00 - {parseInt(hour._id) + 1}:00
                  </span>
                  <span className="text-teal-700 font-semibold">{hour.count} bookings</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No booking data available</p>
          )}
        </Card>

        {/* Popular Services */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Most Popular Services</h3>
          {analytics.bookingAnalytics.popularServices.length > 0 ? (
            <div className="space-y-2">
              {analytics.bookingAnalytics.popularServices.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="font-medium text-slate-900">{service.serviceName}</span>
                  <span className="text-teal-700 font-semibold">{service.count} bookings</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No service data available</p>
          )}
        </Card>
      </div>

      {/* Patient Analytics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Patient Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Total Patients</p>
              <p className="text-2xl font-bold text-slate-900">
                {analytics.patientAnalytics.totalPatients}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">New Patients</p>
              <p className="text-2xl font-bold text-blue-700">
                {analytics.patientAnalytics.newPatients}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Returning</p>
              <p className="text-2xl font-bold text-green-700">
                {analytics.patientAnalytics.returningPatients}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Retention</p>
              <p className="text-2xl font-bold text-slate-900">
                {analytics.patientAnalytics.patientRetention}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Avg Visits/Patient</p>
              <p className="text-2xl font-bold text-slate-900">
                {analytics.patientAnalytics.averageVisitsPerPatient.toFixed(1)}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-green-700">
                {analytics.performanceMetrics.completionRate.toFixed(1)}%
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Avg Appointment Value</p>
              <p className="text-2xl font-bold text-slate-900">
                ${(analytics.performanceMetrics.averageAppointmentValue / 100).toFixed(2)}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-teal-700">
                ${(analytics.performanceMetrics.totalRevenue / 100).toFixed(2)}
              </p>
            </div>
          </Card>
        </div>

        {/* Revenue Trends */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Trends</h3>
          {analytics.performanceMetrics.revenueTrends.length > 0 ? (
            <div className="space-y-2">
              {analytics.performanceMetrics.revenueTrends.slice(-10).map((trend, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="font-medium text-slate-900">
                    {new Date(trend._id).toLocaleDateString()}
                  </span>
                  <span className="text-teal-700 font-semibold">
                    ${(trend.revenue / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No revenue data available</p>
          )}
        </Card>
      </div>
    </div>
  );
}
