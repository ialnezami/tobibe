import type { Metadata } from "next";
import { Providers } from "@/components/providers/SessionProvider";
import { AuthProvider } from "@/lib/auth/context";
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
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
