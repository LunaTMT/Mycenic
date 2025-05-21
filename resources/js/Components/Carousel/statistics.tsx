import React, { useState, useEffect } from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

type SlideData = {
  icon: React.ReactNode;
  text: string;
};

type PropType = {
  slides: SlideData[];
  options?: EmblaOptionsType;
};

const Statistics: React.FC<PropType> = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    AutoScroll({ playOnInit: true, speed: 2 }),
  ]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const autoScroll = emblaApi?.plugins()?.autoScroll;
    if (!autoScroll) return;

    setIsPlaying(autoScroll.isPlaying());
    emblaApi
      .on('autoScroll:play', () => setIsPlaying(true))
      .on('autoScroll:stop', () => setIsPlaying(false))
      .on('reInit', () => setIsPlaying(autoScroll.isPlaying()));
  }, [emblaApi]);

  return (
    <div className="embla ">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide, index) => (
            <div className="embla__slide flex flex-col items-center justify-center" key={index}>
              <div className="embla__slide__icon w-1/2">{slide.icon}</div>
              <p className="embla__slide__text text-center text-2xl font-Aileron_Thin ">{slide.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
