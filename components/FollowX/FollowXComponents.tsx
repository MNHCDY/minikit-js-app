import Image from "next/image";
import React from "react";
import background from "@/public/homepage/background.webp";
import EnterTwitter from "./EnterTwitter";

const FollowXComponents = () => {
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
        <div className="absolute inset-0 z-10 w-full">
          <EnterTwitter />
        </div>
      </div>
    </div>
  );
};

export default FollowXComponents;
