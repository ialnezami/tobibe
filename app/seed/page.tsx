"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to seed database");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please check your MongoDB connection.");
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <div className="mb-4">
          <Link href="/" className="text-teal-700 hover:text-teal-800 text-sm font-medium transition-colors">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Database Seeding</h1>

        <p className="text-slate-600 mb-6">
          Click the button below to seed the database with sample doctors. This will only add
          doctors if the database is empty.
        </p>

        <Button
          variant="primary"
          className="w-full mb-4"
          onClick={handleSeed}
          isLoading={loading}
          disabled={loading}
        >
          {loading ? "Seeding..." : "Seed Database"}
        </Button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <p className="text-red-700 font-semibold">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <p className="text-green-700 font-semibold">Success!</p>
            <p className="text-green-600 text-sm">{result.message}</p>
            {result.doctorCount !== undefined && (
              <p className="text-green-600 text-sm mt-2">
                Doctors in database: {result.doctorCount}
              </p>
            )}
            <div className="mt-4">
              <Link href="/">
                <Button variant="primary" className="w-full">
                  View Doctors
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-slate-500">
            Note: This action is idempotent. It will only seed if the database is empty.
          </p>
        </div>
      </Card>
    </div>
  );
}


