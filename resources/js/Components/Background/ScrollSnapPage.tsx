import React, { useRef, useEffect } from 'react';
import createScrollSnap from 'scroll-snap';
import { easeInOutQuad } from 'easing';

const ScrollSnapExample: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const { bind, unbind } = createScrollSnap(containerRef.current, {
        snapDestinationX: '0%',
        snapDestinationY: '100%',
        timeout: 100,
        duration: 300,
        threshold: 0.2,
        snapStop: false,
        easing: easeInOutQuad,
      }, () => console.log('element snapped'));

      // Clean up the scroll snap when the component is unmounted
      return () => {
        if (unbind) {
          unbind();
        }
      };
    }
  }, []);  // Empty dependency array to run only once when the component mounts

  const handleClick = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div
        id="container"
        ref={containerRef}
        className="flex flex-col overflow-y-scroll h-auto border border-gray-300 rounded-md"
      >
        <div className="snap-item h-screen bg-blue-500  flex justify-center items-center text-white">
          <span>First Item</span>
        </div>
        <div className="snap-item bg-green-500 h-screen flex justify-center items-center text-white">
          <span>Second Item</span>
        </div>
      </div>
      <button
        onClick={handleClick}
        className="ml-4 p-2 bg-blue-500 text-white rounded-md"
      >
        Snap to Next
      </button>
    </div>
  );
};

export default ScrollSnapExample;
