"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/components/Supabase/supabaseClient";
import Image from "next/image";
import background from "@/public/homepage/background.webp";
import { initWeb3Auth, getWalletAddress } from "../../app/lib/web3auth"; // Updated Web3Auth functions

export const Login = () => {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<{ world_id: string; email?: string } | null>(
    null
  );

  // Function to check and save user details in Supabase
  const checkAndSaveTokenToSupabase = async (
    worldIDToken: string,
    walletAddr: string | null,
    email?: string
  ) => {
    try {
      // Check if the user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("world_id")
        .eq("world_id", worldIDToken);

      if (fetchError) {
        console.error("Error checking token in Supabase:", fetchError);
        return;
      }

      // If user does not exist, insert the new World ID and Wallet Address
      if (!existingUser || existingUser.length === 0) {
        const { error } = await supabase.from("users").upsert(
          {
            email: email || "",
            world_id: worldIDToken,
            wallet_address: walletAddr || null, // Store wallet address if available
          },
          { onConflict: "email" }
        );

        if (error) {
          console.error("Error saving to Supabase:", error);
        }
      } else {
        console.log("User already exists in Supabase.");
      }
    } catch (error) {
      console.error("Unexpected error in Supabase operation:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const web3auth = await initWeb3Auth(); // ✅ Ensure Web3Auth is initialized

      const provider = await web3auth.connect();
      if (!provider) {
        throw new Error("Wallet is not connected.");
      }

      const userInfo = await web3auth.getUserInfo();
      console.log("User Info:", userInfo); // 🔍 Log UserInfo to check its structure

      const walletAddr = await getWalletAddress(web3auth);

      // ✅ Use the correct property names from your UserInfo object
      setWalletAddress(walletAddr);
      setUser({
        world_id: userInfo?.idToken || "", // Adjust this based on actual structure
        email: userInfo?.email || "",
      });

      await checkAndSaveTokenToSupabase(
        userInfo?.idToken || "", // Ensure correct key
        walletAddr,
        userInfo?.email
      );

      router.push("/landing-page"); // ✅ Redirect after successful login
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const web3auth = await initWeb3Auth(); // Ensure instance exists
      await web3auth.logout(); // Correct way to log out

      // Reset state
      setWalletAddress(null);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
        Signed in as {user.world_id.slice(0, 10)}
        <br />
        <p>Wallet Address: {walletAddress || "Fetching..."}</p>
        <br />
        <button onClick={handleLogout}>Sign out</button>
        <br />
        <button onClick={() => router.push("/landing-page")}>
          Redirect to App
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="relative w-full h-[100vh] pt-[3vh]">
          <Image
            src={background}
            alt="Background Image"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-10">
            <div className="w-full flex flex-col justify-center items-center gap-[8vh]">
              <div className="w-[88vw] pt-[8vh] flex flex-col justify-between gap-[8vh]">
                <div className="backdrop-blur-sm w-[68vw] pl-[5vw]">
                  <h1 className="text-start text-[10vw] font-bold leading-[13vw] text-[#07494E]">
                    Meet the World’s First Productivity Drink
                  </h1>
                </div>
                <div className="bg-white/40 backdrop-blur-sm py-[4vw] px-[4vw] w-[82vw] text-[#07494E] rounded-lg leading-[13vw]">
                  {[
                    { id: 1, number: "10,000+", title: "cans sold" },
                    { id: 2, number: "20+", title: "offices" },
                    { id: 3, number: "100k+", title: "points earned" },
                  ].map((item) => (
                    <p className="uppercase text-[5vw]" key={item.id}>
                      <span className="font-bold text-[9.5vw]">
                        {item.number}
                      </span>
                      &nbsp;&nbsp;
                      {item.title}
                    </p>
                  ))}
                </div>
              </div>
              <div className="uppercase flex flex-col items-center justify-center w-full gap-[5vw]">
                <button
                  className="bg-[#07494E] text-white py-[3vw] w-[48vw] rounded-lg text-[5vw] font-bold uppercase"
                  onClick={handleLogin}
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
