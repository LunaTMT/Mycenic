import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { SiGoogle } from 'react-icons/si';
import { FaFacebookF } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
interface SocialLoginComponentProps {
  action: 'login' | 'register'; // Accept either 'login' or 'register'
}

const SocialLoginComponent: React.FC<SocialLoginComponentProps> = ({ action }) => {
  const redirect = (provider: string) => {
    Inertia.visit(route('social.redirect', provider));
  };

  return (
    <>
      {/* Top Divider */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-400" />
          </div>
          <div className="relative flex justify-center">
            <span className="z-10 px-2 bg-white text-sm text-gray-500 dark:bg-[#424549] dark:text-gray-400">
              {`Or ${action === 'register' ? 'register' : 'login'} with`}
            </span>
          </div>
        </div>

        {/* Social Buttons Centered */}
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              type="button"
              onClick={() => redirect('google')}
              className="flex h-10 items-center justify-center rounded-lg bg-yellow-500 shadow-md hover:scale-105 hover:bg-yellow-600 dark:bg-[#7289da] dark:hover:bg-[#5b6eae] text-white transition duration-300 ease-in-out"
            >
              <SiGoogle size="1.25rem" />
            </button>

            <button
              type="button"
              onClick={() => redirect('facebook')}
              className="flex h-10 items-center justify-center rounded-lg bg-yellow-500 shadow-md hover:scale-105 hover:bg-yellow-600 dark:bg-[#7289da] dark:hover:bg-[#5b6eae] text-white transition duration-300 ease-in-out"
            >
              <FaFacebookF size="1.25rem" />
            </button>

            <button
              type="button"
              onClick={() => redirect('x')}
              className="flex h-10 items-center justify-center rounded-lg bg-yellow-500 shadow-md hover:scale-105 hover:bg-yellow-600 dark:bg-[#7289da] dark:hover:bg-[#5b6eae] text-white transition duration-300 ease-in-out"
            >
              <FaXTwitter size="1.25rem" />
            </button>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="border-t mt-5 border-gray-400" />
      </div>
    </>
  );
};

export default SocialLoginComponent;
