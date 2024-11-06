"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const SignIn = () => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // Redirect automatically after 5 seconds if signed in
    if (session) {
      const timer = setTimeout(() => {
        router.push("/landing-page");
      }, 5000);

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
