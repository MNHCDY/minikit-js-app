"use client";

// Modify the TypeScript definitions to include `world_id_token`
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
    };
  }
}

export const SignIn = () => {
  const router = useRouter();
  const { data: session } = useSession();

  // Function to check if the World ID already exists in Supabase
  const checkAndSaveTokenToSupabase = async (worldIDToken: string) => {
    try {
      // Check if the user already exists in the "rewards" table
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("world_id")
        .eq("world_id", session?.user?.name || "");

      if (fetchError) {
        console.error("Error checking token in Supabase:", fetchError);
        return;
      }

      // If no record exists, proceed to insert the new World ID
      if (existingUser.length === 0) {
        const { data, error } = await supabase.from("users").upsert(
          {
            email: session?.user?.email || "",
            world_id: worldIDToken,
          },
          { onConflict: "email" }
        );

        if (error) {
          console.error("Error saving token to Supabase:", error);
        } else {
          console.log("Token saved successfully:", data);
        }
      } else {
        console.log(
          "World ID token already exists in Supabase, no need to save."
        );
      }
    } catch (error) {
      console.error("Unexpected error during Supabase operation:", error);
    }
  };

  // Save the token when session is available
  useEffect(() => {
    if (session?.user?.name) {
      checkAndSaveTokenToSupabase(session.user.name);
      console.log(session.user.name);
      router.push("/landing-page");
    }
  }, [session, router]);

  const initiateOAuth = () => {
    window.location.href = "/api/twitter/oauth"; // Redirect to the OAuth endpoint for Twitter
  };

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
