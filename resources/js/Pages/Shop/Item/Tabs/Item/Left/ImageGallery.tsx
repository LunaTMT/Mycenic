import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectCoverflow } from "swiper/modules";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const ImageGallery: React.FC = () => {
  const {
    images,
    imageSources,
    selectedIndex,
    setSelectedIndex,
    selectedImage,
    setSelectedImage,
    item,
    swiperRef,
    setSwiperRef,
  } = useItemContext();

  const resolveSrc = (src: string, source?: string) => {
    if (source && (source.startsWith("http://") || source.startsWith("https://"))) {
      return source;
    }
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }
    return `/${src}`;
  };

  useEffect(() => {
    if (images.length === 0) {
      setSelectedImage("");
      return;
    }
    if (selectedIndex < 0 || selectedIndex >= images.length) {
      return;
    }
    const src = images[selectedIndex];
    const source = imageSources?.[selectedIndex];
    setSelectedImage(resolveSrc(src, source));
  }, [selectedIndex, images, imageSources, setSelectedImage]);

  useEffect(() => {
    if (swiperRef && selectedIndex !== swiperRef.realIndex) {
      swiperRef.slideTo(selectedIndex);
    }
  }, [selectedIndex, swiperRef]);

  const handleSlideClick = (idx: number) => {
    setSelectedIndex(idx);
    if (swiperRef) {
      swiperRef.slideTo(idx);
    }
  };

  return (
    <div className="w-full h-full flex flex-col border rounded-lg bg-white dark:bg-[#1e2124]/30  border-black/20 dark:border-white/20 overflow-hidden">
      {/* Main image container with rounded corners and overflow hidden */}
      <div className="h-[75%] flex items-center justify-center p-5   ">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Selected"
            className="object-contain w-full h-full "
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No image available</p>
        )}
      </div>

      {/* Thumbnails */}
      <div className="h-[25%] py-5 border-t border-black/10 dark:border-white/10">
        <Swiper
          slidesPerView="auto"
          initialSlide={4}
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
          onSwiper={(swiper) => setSwiperRef(swiper)}
          className="h-full"
        >
          {images.map((src, idx) => {
            const thumbSrc = resolveSrc(src, imageSources?.[idx]);
            return (
              <SwiperSlide
                key={idx}
                style={{
                  width: "100px",
                  height: "100px",
                  cursor: "pointer",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
                onClick={() => handleSlideClick(idx)}
              >
                <img
                  src={thumbSrc}
                  alt={item?.name ?? `Thumbnail ${idx}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                  }}
                  className={`border transition-all duration-200 dark:bg-white/40 bg-black/20 ${
                    selectedIndex === idx
                      ? "p-[2px] border-gray-400 dark:border-white/50"
                      : "border-transparent"
                  }`}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default ImageGallery;
