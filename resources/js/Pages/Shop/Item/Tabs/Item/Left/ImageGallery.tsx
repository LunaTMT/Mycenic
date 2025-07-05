import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectCoverflow } from "swiper/modules";
import { useItemContext } from "@/Contexts/Shop/ItemContext";

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

  // Set initial selected index (4 if possible, else max available)
  useEffect(() => {
    if (images.length > 0) {
      const initialIndex = images.length > 4 ? 4 : images.length - 1;
      setSelectedIndex(initialIndex);
    }
  }, [images, setSelectedIndex]);

  // Keep selectedImage in sync
  useEffect(() => {
    const src = images[selectedIndex];
    const source = imageSources?.[selectedIndex];
    setSelectedImage(resolveSrc(src, source));
  }, [selectedIndex, images, imageSources, setSelectedImage]);

  const handleSlideClick = (idx: number) => {
    if (swiperRef) {
      swiperRef.slideTo(idx);
    }
    setSelectedIndex(idx);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border rounded-lg dark:bg-[#424549]/80 border-black/20 dark:border-white/20 overflow-hidden">
      {/* Main image */}
      <div className="flex-grow p-3 flex items-center justify-center overflow-hidden">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Selected"
            className="object-cover w-full h-full rounded-lg"
          />
        ) : (
          <p>No image available</p>
        )}
      </div>

      {/* Thumbnail gallery */}
      <div className="p-3 border-black/20 dark:border-white/20">
        <Swiper
         initialSlide={images.length > 3 ? 3 : images.length - 1}
          slidesPerView="auto"
          centeredSlides={true}
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
          className="mySwiper"
          onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
          onSwiper={(swiper) => setSwiperRef(swiper)}
          style={{ paddingBottom: "50px" }}
        >
          {images.map((src, idx) => {
            const thumbSrc = resolveSrc(src, imageSources?.[idx]);
            return (
              <SwiperSlide
                key={idx}
                style={{
                  width: "120px",
                  height: "120px",
                  cursor: "pointer",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
                onClick={() => handleSlideClick(idx)}
              >
                <img
                  src={thumbSrc}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                  }}
                  className={`border transition-all duration-200 dark:bg-white/40 bg-black/20 ${
                    selectedIndex === idx
                      ? "p-1 border-gray-400 dark:border-white/50"
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
