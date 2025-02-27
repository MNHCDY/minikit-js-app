"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import PurchaseForm from "./PurchaseForm";

const ForegroundPurchaseFlojo = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col justify-items-center w-full text-[#07494E] ">
      <div className="px-[5vw] py-[2vh] flex flex-col gap-[4vw]">
        <div>
          <button
            onClick={() => router.push("/landing-page")}
            className="text-3xl font-extralight"
          >
            <FaArrowLeft />
          </button>
        </div>
        <div className="flex flex-col justify-start items-start px-[4vw] py-[1vh] bg-white/40 backdrop-blur-sm mr-[1vw] rounded-xl  gap-[2vw]">
          <div className="flex justify-between items-end w-[80vw]">
            <h1 className="text-3xl font-bold ">GET $5 OFF</h1>
            <div className="text-[2.5vw] font-bold text-white pb-[3vw] ">
              <p className="bg-[#07494E] rounded-xl  px-[2vw] py-[0.5vw]">
                +40pt
              </p>
            </div>
          </div>
          <p className="text-lg font-normal">a 12-PACK TRIO</p>
        </div>
      </div>
      <div>
        <PurchaseForm />
      </div>
    </div>
  );
};

export default ForegroundPurchaseFlojo;
