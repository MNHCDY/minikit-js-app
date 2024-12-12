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
      <div className="w-[88vw] pt-[18vw] flex flex-col justify-center items-start gap-[18vw] ">
        <div className=" flex flex-col justify-center items-start gap-[10vw]">
          <div className=" backdrop-blur-sm w-[68vw] pl-[5vw]">
            <h1 className="text-start text-[9vw] font-bold leading-[12vw] text-[#07494E]">
              Meet the World’s First Productivity Drink
            </h1>
          </div>
          <div className="bg-white/40 backdrop-blur-sm p-[4vw] w-[87vw] text-[#07494E] rounded-lg leading-[13vw]">
            {data?.map((item: any) => (
              <p className="uppercase text-[5vw] " key={item?.id}>
                <span className="font-bold text-[9vw]">{item?.number}</span>
                &nbsp;&nbsp;
                {item?.title}
              </p>
            ))}
          </div>
        </div>
        <div className="bg-[#07494E] py-[8vw] px-[10vw] rounded-lg leading-[8vw] text-white w-[87vw]">
          <p className="font-bold text-[6vw] text-center">
            Complete the tasks below to earn points
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForeGround;
