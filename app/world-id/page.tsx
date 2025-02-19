import { PayBlock } from "@/components/Pay";
import { Login } from "@/components/SignIn/index";
import { VerifyBlock } from "@/components/Verify";

export default function page() {
  // console.log("SECRET ", process.env.NEXTAUTH_SECRET);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
      <Login />
      <VerifyBlock />
      {/* <PayBlock /> */}
    </main>
  );
}
