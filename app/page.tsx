"use client";
import { PayBlock } from "@/components/Pay";
import { SignIn } from "@/components/SignIn";
import { VerifyBlock } from "@/components/Verify";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  // const router = useRouter();

  // useEffect(() => {
  //   // Redirect to '/landing-page' when the component mounts
  //   router.push("/landing-page");
  // }, [router]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
      <SignIn />
      {/* <VerifyBlock />
      <PayBlock /> */}
    </main>
  );
}
