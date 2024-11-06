import React from "react";

const Footer = () => {
  const data = [
    {
      id: 1,
    },
    {
      id: 2,
    },
    {
      id: 3,
    },
    {
      id: 4,
    },
    {
      id: 5,
    },
    {
      id: 6,
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
            <div key={item?.id} className="p-[10vw] bg-white "></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;
