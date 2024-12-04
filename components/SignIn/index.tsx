"use client";

// Modify the TypeScript definitions to include `world_id_token`
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/components/Supabase/supabaseClient";
import Image from "next/image";
import background from "@/public/homepage/background.webp";

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
  const data = [
    { id: 1, number: "10, 000+", title: "cans sold" },
    {
      id: 2,
      number: "20+",
      title: "offices",
    },
    {
      id: 3,
      number: "100k+",
      title: "points earned",
    },
  ];

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
          // console.log("Token saved successfully:", data);
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
      // console.log(session.user.name);
      router.push("/landing-page");
    }
  }, [session, router]);

  const initiateOAuth = () => {
    window.location.href = "/api/twitter/oauth"; // Redirect to the OAuth endpoint for Twitter
  };

  if (session) {
    return (
      <>
        <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
          Signed in as {session?.user?.name?.slice(0, 10)} <br />
          <button onClick={() => signOut()}>Sign out</button>
          <br />
          <button onClick={() => router.push("/landing-page")}>
            Redirect to App
          </button>
        </div>
      </>
    );
  } else {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Container for Background and Foreground */}
        <div className="relative w-full h-[100vh] pt-[3vh]">
          {/* Background Image */}
          <Image
            src={background}
            alt="Background Image"
            className="w-full h-full object-cover"
          />

          {/* Foreground Content layered over the Background */}
          <div className="absolute inset-0 z-10">
            <div className="w-full  flex flex-col justify-center items-center gap-[16vw]">
              <div className="w-[88vw] pt-[18vw] flex flex-col justify-between gap-[20vw]">
                <div className=" backdrop-blur-sm w-[68vw] pl-[5vw]">
                  <h1 className="text-start text-[10vw] font-bold leading-[13vw] text-[#07494E]">
                    Meet the World’s First Productivity Drink
                  </h1>
                </div>
                <div className="bg-white/40 backdrop-blur-sm py-[4vw] px-[4vw] w-[82vw] text-[#07494E] rounded-lg leading-[13vw]">
                  {data?.map((item: any) => (
                    <p className="uppercase text-[5vw] " key={item?.id}>
                      <span className="font-bold text-[9.5vw]">
                        {item?.number}
                      </span>
                      &nbsp;&nbsp;
                      {item?.title}
                    </p>
                  ))}
                </div>
              </div>
              <div className="uppercase flex flex-col items-center justify-center w-full gap-[5vw] ">
                <button
                  className="bg-[#07494E] text-white py-[3vw] w-[48vw] rounded-lg text-[5vw] font-bold uppercase"
                  onClick={() => signIn()}
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
