import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth"; // Adjust the path if needed

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
