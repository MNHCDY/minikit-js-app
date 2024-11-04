"use client";
import { useRouter } from "next/navigation";

const Options = () => {
  const router = useRouter();
  const goToAnotherPage = () => {
    router.push("/landing-page"); // specify the route
  };
  return (
    <div>
      <div>
        <button onClick={goToAnotherPage}>
          {/* <FaArrowLeft /> */}
          asd
        </button>
      </div>
    </div>
  );
};

export default Options;
