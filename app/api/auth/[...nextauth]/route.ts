import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connect";
import User from "@/lib/models/User";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ NEXTAUTH_SECRET is missing! Please set it in your environment variables.");
  console.error("Generate one with: openssl rand -base64 32");
}

if (!process.env.DATABASE_URL && !process.env.MONGODB_URI) {
  console.error("❌ DATABASE_URL or MONGODB_URI is missing! Please set it in your environment variables.");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        // Check for missing environment variables
        if (!process.env.NEXTAUTH_SECRET) {
          throw new Error(
            "Server configuration error: NEXTAUTH_SECRET is missing. Please check VERCEL_ENV_SETUP.md for setup instructions."
          );
        }

        if (!process.env.DATABASE_URL && !process.env.MONGODB_URI) {
          throw new Error(
            "Server configuration error: DATABASE_URL or MONGODB_URI is missing. Please check VERCEL_ENV_SETUP.md for setup instructions."
          );
        }

        try {
          await connectDB();
        } catch (error: any) {
          // Check if it's a MongoDB connection error
          if (
            error?.message?.includes("Could not connect") ||
            error?.message?.includes("MongoServerSelectionError") ||
            error?.message?.includes("IP") ||
            error?.message?.includes("whitelist")
          ) {
            throw new Error(
              "Database connection failed. Please check your MongoDB connection and ensure your IP address is whitelisted in MongoDB Atlas."
            );
          }
          if (error?.message?.includes("DATABASE_URL") || error?.message?.includes("MONGODB_URI")) {
            throw new Error(
              "Database connection string is missing. Please set DATABASE_URL or MONGODB_URI in your environment variables."
            );
          }
          throw new Error("Database connection error. Please try again later.");
        }

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };


