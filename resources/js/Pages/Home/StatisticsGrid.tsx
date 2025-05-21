import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import SlotCounter from 'react-slot-counter';

import FadeInOut from "@/Components/Animations/FadeInOut";
// Import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function StatisticsGrid() {
    const items = [
        { id: 1, title: "REVIEWS", number: 200 },
        { id: 2, title: "SALES", number: 156 },
        { id: 3, title: "DELIVERIES", number: 420 },
        { id: 4, title: "SPORES SOLD", number: 69 },
        { id: 5, title: "KITS SOLD", number: 666 },
        { id: 6, title: "SPAWN SOLD", number: 999 },
      ];

    

  return (
    <div className="relative h-[30vh] w-full 
     
    dark:bg-gradient-to-b dark:from-slate-600 dark:to-slate-500">
      <FadeInOut>
        <Swiper
          effect="fade"
          slidesPerView={4}
          spaceBetween={10}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          loop={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper w-[70%] h-full"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="rounded-lg w-full h-full   dark:text-white flex flex-col justify-center items-center">
                <div className="text-center text-4xl font-Audrey mb-2 text-shadow-beige-glow">
                  {item.title}
                </div>
                <div className="text-center  font-Poppins text-5xl">
                  <SlotCounter value={item.number} animateOnVisible={{ triggerOnce: true, rootMargin: '0px 0px 0px 0px' }} startValue={999}/>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </FadeInOut>
    </div>
  );
}
