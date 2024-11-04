"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export const SignIn = () => {
  console.log("SECRET ", process.env.NEXTAUTH_SECRET);

  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session?.user?.name?.slice(0, 10)} <br />
        <button onClick={() => signOut()}>Sign out</button>
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
