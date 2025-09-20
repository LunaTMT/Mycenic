import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import '@css/ItemDisplay.css';

export default function ItemDisplay() {
  return (
    <Swiper
      modules={[Autoplay, EffectFade, Pagination]}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      effect="fade"
      loop
      pagination={{ clickable: true }}
      className="w-full h-full swiper-container"
    >
      <SwiperSlide>
        <img
          src="/assets/images/cultivation.png"
          alt="Slide 1"
          className="object-cover w-full h-full"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="/assets/images/infused_mushroom_products.png"
          alt="Slide 2"
          className="object-cover w-full h-full"
        />
      </SwiperSlide>
      <SwiperSlide>
        <img
          src="/assets/images/education.png"
          alt="Slide 3"
          className="object-cover w-full h-full"
        />
      </SwiperSlide>
    </Swiper>
  );
}
