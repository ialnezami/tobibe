"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface AuthContextType {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "loading",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  return (
    <AuthContext.Provider
      value={{
        user: session?.user
          ? {
              id: (session.user as any).id,
              email: session.user.email || "",
              name: session.user.name || "",
              role: (session.user as any).role || "customer",
            }
          : null,
        status: status === "loading" ? "loading" : session ? "authenticated" : "unauthenticated",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

