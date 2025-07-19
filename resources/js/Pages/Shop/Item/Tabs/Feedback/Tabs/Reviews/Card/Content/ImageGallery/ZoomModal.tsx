import React from "react";

interface Props {
  imageUrl: string;
  onClose: () => void;
}

export default function ZoomModal({ imageUrl, onClose }: Props) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-zoom-out">
      <img src={imageUrl} alt="Zoomed review image" className="max-w-[90vw] max-h-[90vh] rounded-md shadow-lg" />
    </div>
  );
}
