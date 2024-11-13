// lib/session.ts
import { withIronSessionApiRoute } from "iron-session/next";
import type { SessionOptions } from "iron-session";
import type { NextApiRequest, NextApiResponse } from "next";

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "twitter_oauth_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

// Extend the IronSessionData to type our session variables
declare module "iron-session" {
  interface IronSessionData {
    codeVerifier?: string;
    state?: string;
  }
}

// Helper to apply `withIronSessionApiRoute` on API routes
export function withSession(handler: any) {
  return withIronSessionApiRoute(handler, sessionOptions);
}
