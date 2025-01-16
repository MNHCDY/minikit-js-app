import Image from "next/image";
import React from "react";
import background from "@/public/homepage/background.webp";
import ForeGround from "./ForeGround";
import Footer from "./Footer";

const HomepageComponents = () => {
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
          <ForeGround />
        </div>
      </div>

      {/* Footer immediately below the Background Image */}
      {/* <div className="w-full fixed bottom-0 left-0 z-20 bg-white">
        <Footer />
      </div> */}
    </div>
  );
};

export default HomepageComponents;
