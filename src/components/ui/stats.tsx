import React from "react";
import CountUp from "../TextAnimations/CountUp/CountUp";

const stats = () => {
  return (
    <section className="p-6 mt-10 text-primary dark:text-white">
      <div className="container mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-74">
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <CountUp
                from={0}
                to={1000}
                separator=","
                direction="up"
                duration={2}
                className="count-up-text text-6xl font-bold"
              />
              <h1 className="text-5xl font-extrabold">+</h1>
            </div>
            <p className="text-sm sm:text-base">Books shared</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <CountUp
                from={0}
                to={300}
                separator=","
                direction="up"
                duration={2}
                className="count-up-text text-6xl font-bold"
              />
              <h1 className="text-5xl font-extrabold">+</h1>
            </div>
            <p className="text-sm sm:text-base">Active readers</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <CountUp
                from={0}
                to={3}
                separator=","
                direction="up"
                duration={2}
                className="count-up-text text-6xl font-bold"
              />
              <h1 className="text-5xl font-extrabold">+</h1>
            </div>
            <p className="text-sm sm:text-base">Published books</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <CountUp
                from={0}
                to={8}
                separator=","
                direction="up"
                duration={2}
                className="count-up-text text-6xl font-bold"
              />
              <h1 className="text-5xl font-extrabold">+</h1>
            </div>
            <p className="text-sm sm:text-base">TED talks</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default stats;
