import type { Metadata } from "next";
import { Providers } from "@/components/providers/SessionProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { AuthProvider } from "@/lib/auth/context";
import LanguageWrapper from "@/components/LanguageWrapper";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doctor Booking App",
  description: "Book doctor appointments with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <Providers>
          <LanguageProvider>
            <LanguageWrapper>
              <AuthProvider>
                {children}
                <Chatbot />
              </AuthProvider>
            </LanguageWrapper>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
