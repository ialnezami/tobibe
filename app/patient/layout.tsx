"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "customer") {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  if (status === "loading" || session?.user?.role !== "customer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: "/patient/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/patient/appointments", label: "My Appointments", icon: "📅" },
    { href: "/patient/favorites", label: "Favorite Doctors", icon: "⭐" },
    { href: "/notifications", label: "Notifications", icon: "🔔" },
    { href: "/patient/records", label: "Medical Records", icon: "📋" },
    { href: "/patient/health-metrics", label: "Health Metrics", icon: "📊" },
    { href: "/patient/documents", label: "Documents", icon: "📄" },
    { href: "/patient/prescriptions", label: "Prescriptions", icon: "💊" },
    { href: "/patient/reminders", label: "Reminders", icon: "⏰" },
    { href: "/patient/profile", label: "Health Profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 lg:hidden sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-slate-900">My Health</h1>
          <Link href="/api/auth/signout">
            <Button variant="outline" className="text-xs px-2 py-1">
              Logout
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-40 transition-transform duration-200 ease-in-out lg:block`}
        >
          <div className="flex flex-col h-full">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">My Health</h2>
              <Link href="/api/auth/signout">
                <Button variant="outline" className="text-xs px-2 py-1">
                  Logout
                </Button>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition-colors font-medium"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-700 font-semibold">
                    {session?.user?.name?.charAt(0).toUpperCase() || "P"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {session?.user?.name || "Patient"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}


