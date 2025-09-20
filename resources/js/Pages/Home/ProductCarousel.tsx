import React from "react";
import { motion } from "framer-motion"; // Import motion for animations
import { Swiper, SwiperSlide } from "swiper/react";

import FadeInOut from "@/Components/Animations/FadeInOut";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function ProductCarousel() {
  const items = [
    { id: 1, text: "GROW KITS", image: "/assets/images/grid/grow_kits.png" },
    { id: 2, text: "SPORES", image: "/assets/images/grid/spore_syringe.png" },
    { id: 3, text: "SPAWN", image: "/assets/images/grid/spawn.png" },
    { id: 4, text: "GOURMET", image: "/assets/images/grid/gourmet.png" },
    { id: 5, text: "INFUSED", image: "/assets/images/grid/infused.png" },
    { id: 6, text: "MEDICINAL", image: "/assets/images/grid/medicinal.png" },
    { id: 7, text: "FORAGING", image: "/assets/images/grid/foraging2.png" },
    { id: 8, text: "MICROSCOPY", image: "/assets/images/grid/microscopy.png" },
    { id: 9, text: "AGAR", image: "/assets/images/grid/agar.png" },
  ];

  return (
      <div className="relative h-[44vh] w-full bg-transparent shadow-lg">

        <Swiper
          slidesPerView={4}
          spaceBetween={0}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true} 
          loop={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper w-[90%] h-full"
        >
          
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="relative overflow-hidden rounded-lg w-full h-full group ">
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.text}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/75 via-transparent to-transparent bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-white text-5xl text-shadow-beige-glow font-Audrey mb-4">
                    {item.text}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

 
    
    </div>
  );
}
