"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if it's a database connection error
        if (result.error.includes("Database connection") || result.error.includes("MongoDB")) {
          setError(
            `${result.error}\n\nPlease check your MongoDB connection. See MONGODB_TROUBLESHOOTING.md for help.`
          );
        } else {
          setError(result.error);
        }
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Sign In</h1>
          <p className="mt-2 text-sm text-slate-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-teal-700 hover:text-teal-800 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
              <p className="whitespace-pre-line">{error}</p>
              {error.includes("Database connection") && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-sm text-red-600 mb-2">
                    <strong>Quick Fix:</strong> Whitelist your IP address in MongoDB Atlas:
                  </p>
                  <ol className="text-sm text-red-600 list-decimal list-inside space-y-1">
                    <li>Go to <a href="https://cloud.mongodb.com/" target="_blank" rel="noopener noreferrer" className="underline">MongoDB Atlas</a></li>
                    <li>Navigate to: Security → Network Access</li>
                    <li>Click "Add IP Address" → "Add Current IP Address"</li>
                    <li>Wait 1-2 minutes for changes to take effect</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
}

