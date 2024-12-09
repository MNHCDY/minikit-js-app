"use client";
import { useRouter } from "next/navigation";
import React from "react";

const ForeGround = () => {
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

  const goToAnotherPage = () => {
    router.push("/reward-page"); // specify the route
  };
  return (
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
              <span className="font-bold text-[9.5vw]">{item?.number}</span>
              &nbsp;&nbsp;
              {item?.title}
            </p>
          ))}
        </div>
      </div>
      {/* <div className="uppercase flex flex-col items-center justify-center w-full gap-[5vw] ">
        <button
          className="bg-[#07494E] text-white py-[3vw] w-[88vw] rounded-lg text-[5vw] font-bold uppercase"
          onClick={goToAnotherPage}
        >
          see all rewards
        </button>
        <button className="bg-white text-[#07494E] border-[#07494E] border-2 py-[3vw] w-[88vw] rounded-lg text-[5vw] font-bold uppercase">
          purchase flojo
        </button>
      </div> */}
    </div>
  );
};

export default ForeGround;
