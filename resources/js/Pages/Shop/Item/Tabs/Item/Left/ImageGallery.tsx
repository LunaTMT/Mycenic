import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectCoverflow } from "swiper/modules";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";
import { resolveImageSrc } from "@/utils/resolveImageSrc";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const ImageGallery: React.FC = () => {
  const { item } = useItemContext();
  const images = Array.isArray(item.images) ? item.images : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const swiperRef = useRef<any>(null);

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(resolveImageSrc(images[selectedIndex].path));
    }
    if (swiperRef.current && swiperRef.current.slideTo) {
      swiperRef.current.slideTo(selectedIndex);
    }
  }, [selectedIndex, images]);

  if (images.length === 0) {
    return <div>No images available</div>;
  }

  return (
    <div className="w-full h-full flex flex-col border rounded-lg bg-white dark:bg-[#1e2124]/30 border-black/20 dark:border-white/20 overflow-hidden">
      {/* Main Image Container */}
      <div className="h-[75%] flex items-center justify-center rounded-lg rounded-b-none overflow-hidden bg-gray-50 dark:bg-gray-900">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={`Image ${selectedIndex + 1}`}
            className="object-cover w-full h-full"
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No image available</p>
        )}
      </div>

      {/* Thumbnails Swiper */}
      <div className="h-[25%] pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-center">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          slidesPerView="auto"
          initialSlide={0}
          centeredSlides
          spaceBetween={10}
          effect="coverflow"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
          className="h-full w-full flex items-center justify-center"
          style={{ overflow: "visible" }}
        >
          {images.map((img, idx) => (
            <SwiperSlide
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              style={{
                width: "100px",
                height: "100px",
                cursor: "pointer",
                borderRadius: "0.75rem",
                overflow: "hidden",
                transformOrigin: "center center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: selectedIndex === idx ? "2px" : "0",
              }}
              className={`transition-all duration-300 rounded-xl ${
                selectedIndex === idx
                  ? "scale-[1.03] bg-yellow-500 dark:bg-[#384361]"
                  : "bg-transparent dark:bg-transparent"
              }`}
            >
              <img
                src={resolveImageSrc(img.path)}
                alt={`Thumbnail ${idx + 1}`}
                className={`w-full h-full object-cover rounded-xl block border transition-all duration-200 ${
                  selectedIndex === idx
                    ? "border-yellow-400 dark:border-[#93c5fd]"
                    : "border-transparent"
                }`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ImageGallery;
