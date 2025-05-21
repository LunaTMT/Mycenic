import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function StarsGrid() {
    const items = [
        { id: 1, title: "⭐", number: 0 },
        { id: 2, title: "⭐⭐", number:  2},
        { id: 3, title: "⭐⭐⭐", number: 5 },
        { id: 4, title: "⭐⭐⭐⭐", number: 70 },
        { id: 5, title: "⭐⭐⭐⭐⭐", number: 256 },
    ];

  return (
    <div className="relative h-[10vh] w-full">
      <Swiper
        effect="fade"
        slidesPerView={5}
        spaceBetween={10}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper w-[60%] h-full"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="rounded-lg w-full h-full text-black dark:text-white gap-5 flex flex-col justify-center items-center">
              <div className="text-center text-3xl font-extralight font-Poppins">
                {item.number}
              </div>
              <div
                className="text-center text-2xl text-yellow-500 dark:text-yellow-400"
                
              >
                {item.title}
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
