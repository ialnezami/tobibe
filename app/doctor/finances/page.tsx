"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PaymentMethod {
  _id: string;
  total: number;
  count: number;
}

interface RecentPayment {
  _id: string;
  customerId: { name: string };
  payment: { amount: number; method: string; paidAt?: string };
  date: string;
}

export default function DoctorFinancesPage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidRevenue, setPaidRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    fetchFinances();
  }, [period]);

  const fetchFinances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (period !== "all") params.append("period", period);

      const response = await fetch(`/api/doctor/finances?${params}`);
      const data = await response.json();
      if (response.ok) {
        setTotalRevenue(data.totalRevenue || 0);
        setPaidRevenue(data.paidRevenue || 0);
        setPendingRevenue(data.pendingRevenue || 0);
        setPaymentMethods(data.paymentMethods || []);
        setRecentPayments(data.recentPayments || []);
      }
    } catch (error) {
      console.error("Error fetching finances:", error);
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
            <p className="text-slate-600 text-sm font-medium">Loading finances...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
          💰 Financial Dashboard
        </h1>
        <p className="text-slate-600">Track your revenue and payments</p>
      </div>

      {/* Period Filter */}
      <Card className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "today", "week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                period === p
                  ? "bg-teal-700 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💰</span>
            <p className="text-sm text-slate-600">Total Revenue</p>
          </div>
          <p className="text-2xl font-semibold text-slate-900">
            ${(totalRevenue / 100).toFixed(2)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✅</span>
            <p className="text-sm text-slate-600">Paid Revenue</p>
          </div>
          <p className="text-2xl font-semibold text-green-700">
            ${(paidRevenue / 100).toFixed(2)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⏳</span>
            <p className="text-sm text-slate-600">Pending Payments</p>
          </div>
          <p className="text-2xl font-semibold text-orange-700">
            ${(pendingRevenue / 100).toFixed(2)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">💳 Payment Methods</h2>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💳</div>
              <p className="text-slate-500 text-sm">No payment data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {method._id || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">{method.count} transactions</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    ${(method.total / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Payments */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">🕐 Recent Payments</h2>
          {recentPayments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💵</div>
              <p className="text-slate-500 text-sm">No recent payments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {payment.customerId?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(payment.date).toLocaleDateString()} • {payment.payment.method}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    ${(payment.payment.amount / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


