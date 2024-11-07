import React from "react";
import google from "@/public/homepage/company-logos/google.webp";
import microsoft from "@/public/homepage/company-logos/microsoft.webp";
import stripe from "@/public/homepage/company-logos/stripe.webp";
import dbs from "@/public/homepage/company-logos/dbs.webp";
import ripple from "@/public/homepage/company-logos/ripple.webp";
import citadel from "@/public/homepage/company-logos/citadel.svg";
import Image from "next/image";

const Footer = () => {
  const data = [
    {
      id: 1,
      image: google,
    },
    {
      id: 2,
      image: microsoft,
    },
    {
      id: 3,
      image: stripe,
    },
    {
      id: 4,
      image: ripple,
    },
    {
      id: 5,
      image: dbs,
    },
    {
      id: 6,
      image: citadel,
    },
  ];
  return (
    <div className="bg-[#07494E] w-full  flex justify-center items-center ">
      <div className="w-[65vw] py-[10vw] flex flex-col gap-[10vw]">
        <div>
          <h1 className="text-white text-center text-[5vw] font-semibold">
            FUELLING THE WORLD’S BRIGHTEST MINDS
          </h1>
        </div>
        <div className="flex flex-wrap gap-[10vw] justify-center items-center">
          {data?.map((item: any) => (
            <div key={item?.id} className=" ">
              <Image src={item?.image} alt="img" className="w-[25vw]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;
