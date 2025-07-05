import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../../css/swiper_welcome.css';



// Import required modules
import { Navigation, Pagination } from 'swiper/modules';
import { Inertia } from '@inertiajs/inertia';

// Assuming PrimaryButton is imported from your components
import PrimaryButton from "@/Components/Buttons/PrimaryButton";

const items = [
  { 
    id: 1, 
    text: "GROW KITS", 
    image: "/assets/images/grid/grow_kits.png",
    description: "Everything you need to cultivate your own mushrooms at home with ease.",
    category: "GROW KITS"
  },
  { 
    id: 2, 
    text: "SPORES", 
    image: "/assets/images/grid/spore_syringe2.png",
    description: "High-quality mushroom spores, perfect for microscopy and research purposes.",
    category: "SPORES"
  },
  { 
    id: 3, 
    text: "SPAWN", 
    image: "/assets/images/grid/spawn.png",
    description: "Colonized grain spawn for reliable and efficient mushroom growth.",
    category: "SPAWN"
  },
  { 
    id: 4, 
    text: "INFUSED", 
    image: "/assets/images/grid/infused.png",
    description: "Explore our selection of infused mushroom products designed for wellness.",
    category: "INFUSED"
  },
  { 
    id: 5, 
    text: "INFUSED", 
    image: "/assets/images/grid/infused.png",
    description: "Explore our selection of infused mushroom products designed for wellness.",
    category: "INFUSED"
  },
  { 
    id: 6, 
    text: "INFUSED", 
    image: "/assets/images/grid/infused.png",
    description: "Explore our selection of infused mushroom products designed for wellness.",
    category: "INFUSED"
  },
  { 
    id: 7, 
    text: "INFUSED", 
    image: "/assets/images/grid/infused.png",
    description: "Explore our selection of infused mushroom products designed for wellness.",
    category: "INFUSED"
  },
];

export default function Products() {
  return (
    <div className="w-full min-h-screen h-full space-y-5 flex flex-col items-center justify-center  border-gray-300 dark:border-white/50 ">
      
      {/* Centered Title */}
      <h1 className="text-7xl font-Audrey text-center dark:text-transparent dark:bg-clip-text dark:to-white leading-tight dark:text-shadow-beige-glow bg-gradient-to-t dark:via-white/50 dark:from-slate-200 to-white">
        PRODUCTS
      </h1>

      <Swiper
        spaceBetween={30} // Adjust spacing between slides
        slidesPerView={5}// Show 3 items per slide
        centeredSlides={true} // Center slides
        loop={true} // Enable looping
        navigation={true}
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}
        className="w-[100%] relative mask-gradient "
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className="relative flex  mb-5 space-y-5 flex-col items-center justify-center  dark:text-white rounded-lg group">
            
            <div 
              className="relative flex justify-center items-center w-auto cursor-pointer overflow-hidden rounded-xl"
              onClick={() => Inertia.visit(route("shop", { category: item.category }))} // Image is now a link
            >
              <img src={item.image} alt={item.text} className="w-[350px] h-[350px] object-cover transition-transform duration-300 group-hover:scale-105" />

              {/* Hover Overlay with Description */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4 rounded-xl">
                <p className="text-md font-Poppins">{item.description}</p>
              </div>
            </div>

            {/* Always Visible Title */}
            <h2 className="text-3xl font-bold font-Audrey ">{item.text}</h2>

          </SwiperSlide>
        ))}
      </Swiper>

      {/* Centered Shop Button */}
      <div className="mt-4">
        <PrimaryButton onClick={() => Inertia.visit(route("shop"))}>
          SHOP NOW
        </PrimaryButton>
      </div>

    </div>
  );
}
