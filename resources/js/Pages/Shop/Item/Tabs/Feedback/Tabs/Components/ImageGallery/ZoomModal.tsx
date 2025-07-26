import React from "react";

interface Props {
  imageUrl: string;
  onClose: () => void;
}

export default function ZoomModal({ imageUrl, onClose }: Props) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 space-y-2  bg-black/70 flex flex-col items-center justify-center z-50 cursor-zoom-out"
    >
      <img
        src={imageUrl}
        alt="Zoomed review image"
        className="max-w-[50vw] max-h-[50vh] rounded-md shadow-lg"
      />
      <p className="text-left text-sm text-white dark:text-gray-500 select-none">
        Click to return.
      </p>
    </div>
  );
}
