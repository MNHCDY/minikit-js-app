"use client";

// Modify the TypeScript definitions to include `world_id_token`
import { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/components/Supabase/supabaseClient";

// Extend the Session type to include world_id_token
declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null;
      name?: string | null;
      world_id_token?: string; // Adding world_id_token to session.user
    };
  }
}

export const SignIn = () => {
  const router = useRouter();
  const { data: session } = useSession();

  // Function to save World ID token to Supabase
  const saveTokenToSupabase = async (worldIDToken: string) => {
    try {
      const { data, error } = await supabase.from("users").upsert(
        {
          email: session?.user?.email || "", // Set a default empty string if email is null
          world_id: worldIDToken,
        },
        { onConflict: "email" }
      );

      if (error) {
        console.error("Error saving token to Supabase:", error);
      } else {
        console.log("Token saved successfully:", data);
      }
    } catch (error) {
      console.error("Unexpected error saving token:", error);
    }
  };

  // Save the token when session is available
  useEffect(() => {
    if (session?.user?.name) {
      saveTokenToSupabase(session.user.name);
      console.log(session.user.name);

      // Redirect automatically after 5 seconds if signed in
      const timer = setTimeout(() => {
        router.push("/landing-page");
      }, 50000000000);

      // Cleanup the timer if the component is unmounted or session changes
      return () => clearTimeout(timer);
    }
  }, [session, router]);

  if (session) {
    return (
      <>
        Signed in as {session?.user?.name?.slice(0, 10)} <br />
        <button onClick={() => signOut()}>Sign out</button>
        <br />
        <button onClick={() => router.push("/landing-page")}>
          Redirect to App
        </button>
      </>
    );
  } else {
    return (
      <>
        Not signed in <br />
        <button onClick={() => signIn()}>Sign in</button>
      </>
    );
  }
};
