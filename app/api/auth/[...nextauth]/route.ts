// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ensure this path is correct and points to your auth configuration

// Handler to set up NextAuth with options
const handler = NextAuth(authOptions);

// Export only the handlers for GET and POST as required by Next.js routes
export { handler as GET, handler as POST };
