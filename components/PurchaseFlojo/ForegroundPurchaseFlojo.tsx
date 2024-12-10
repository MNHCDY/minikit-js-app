"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import PurchaseForm from "./PurchaseForm";

const ForegroundPurchaseFlojo = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col justify-items-center w-full text-[#07494E] ">
      <div className="p-[5vw] flex flex-col gap-[4vw]">
        <div>
          <button
            onClick={() => router.push("/landing-page")}
            className="text-[10vw] font-extralight"
          >
            <FaArrowLeft />
          </button>
        </div>
        <div>
          <h1 className="text-[10vw] font-bold leading-[8vw] p-[4vw] bg-white/40 backdrop-blur-sm mr-[1vw] rounded-xl">
            GET $5 OFF <br />
            <span className="text-[5vw] font-normal">a 12-PACK TRIO</span>
          </h1>
        </div>
      </div>
      <div>
        <PurchaseForm />
      </div>
    </div>
  );
};

export default ForegroundPurchaseFlojo;
