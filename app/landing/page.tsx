"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/context";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();

  const features = [
    {
      icon: "🔍",
      title: "Find Doctors Easily",
      description: "Search and discover healthcare professionals near you with our advanced search and map features.",
    },
    {
      icon: "📅",
      title: "Book Instantly",
      description: "Schedule appointments in just a few clicks. See real-time availability and book your preferred time slot.",
    },
    {
      icon: "💬",
      title: "Direct Communication",
      description: "Chat with your doctor before and after appointments. Get answers to your questions quickly.",
    },
    {
      icon: "📊",
      title: "Health Tracking",
      description: "Track your health metrics, manage prescriptions, and store medical documents all in one place.",
    },
    {
      icon: "⭐",
      title: "Favorite Doctors",
      description: "Save your preferred doctors for quick access and easy booking in the future.",
    },
    {
      icon: "🔔",
      title: "Smart Reminders",
      description: "Never miss an appointment with automated reminders and notifications.",
    },
  ];

  const benefits = [
    {
      title: "For Patients",
      items: [
        "Easy appointment booking",
        "24/7 access to your health records",
        "Direct communication with doctors",
        "Prescription management",
        "Health metrics tracking",
      ],
    },
    {
      title: "For Doctors",
      items: [
        "Streamlined patient management",
        "Automated scheduling system",
        "Patient history and records",
        "Analytics and insights",
        "Revenue tracking",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">🩺</span>
              </div>
              <span className="text-xl font-bold text-slate-900">TobiBe</span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {session ? (
                <Link href={session.user.role === "customer" ? "/patient/dashboard" : session.user.role === "doctor" ? "/doctor/dashboard" : "/admin/dashboard"}>
                  <Button variant="primary" className="text-sm px-4 py-2">
                    {t("nav.dashboard")} →
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="text-sm px-4 py-2">
                      {t("common.login")}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" className="text-sm px-4 py-2">
                      {t("common.signUp")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                🎉 New: Multilingual Support (EN, AR, FR)
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Your Health, <span className="text-teal-600">Simplified</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 leading-relaxed">
              Book doctor appointments, manage your health records, and stay connected with healthcare professionals—all in one modern platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session ? (
                <>
                  <Link href="/register">
                    <Button variant="primary" className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
                      Get Started Free 🚀
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="px-8 py-4 text-lg font-semibold border-2">
                      Browse Doctors 👨‍⚕️
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/">
                  <Button variant="primary" className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
                    Browse Doctors 👨‍⚕️
                  </Button>
                </Link>
              )}
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>Free to Use</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to make healthcare management simple and efficient
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Built for Everyone
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Whether you're a patient or a healthcare provider, we've got you covered
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-8 rounded-xl bg-white border border-slate-200 shadow-lg"
              >
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  {benefit.title}
                </h3>
                <ul className="space-y-3">
                  {benefit.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <span className="text-teal-600 text-xl mt-1">✓</span>
                      <span className="text-slate-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">100+</div>
              <div className="text-slate-600">Doctors Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">1K+</div>
              <div className="text-slate-600">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">5K+</div>
              <div className="text-slate-600">Appointments Booked</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">24/7</div>
              <div className="text-slate-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            Join thousands of patients and doctors who trust TobiBe for their healthcare management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!session ? (
              <>
                <Link href="/register">
                  <Button variant="secondary" className="px-8 py-4 text-lg font-semibold bg-white text-teal-700 hover:bg-slate-100">
                    Create Free Account 🎉
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white/10">
                    Browse Doctors 👨‍⚕️
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/">
                <Button variant="secondary" className="px-8 py-4 text-lg font-semibold bg-white text-teal-700 hover:bg-slate-100">
                  Go to Dashboard 📊
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🩺</span>
                </div>
                <span className="text-white font-bold">TobiBe</span>
              </div>
              <p className="text-sm">
                Your trusted healthcare management platform
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Patients</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-teal-400 transition-colors">Find Doctors</Link></li>
                <li><Link href="/register" className="hover:text-teal-400 transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-teal-400 transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Doctors</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-teal-400 transition-colors">Join as Doctor</Link></li>
                <li><Link href="/login" className="hover:text-teal-400 transition-colors">Doctor Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-teal-400 transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-teal-400 transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} TobiBe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

