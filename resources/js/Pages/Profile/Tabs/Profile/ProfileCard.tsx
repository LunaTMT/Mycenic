import { usePage, useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { FaUpload } from 'react-icons/fa';

import { resolveSrc } from '@/utils/resolveSrc';

interface User {
  name: string;
  email?: string;
  created_at?: string;
  avatar?: string | null;
  email_verified_at?: string | null;
}

export default function ProfileCard() {
  const page = usePage();
  const user = page.props.auth.user as User;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { post, processing, errors, reset } = useForm();

  useEffect(() => {
    if (user.avatar) {
      // Use resolveSrc utility here
      const resolved = resolveSrc(user.avatar);
      setAvatarUrl(resolved);
    } else {
      setAvatarUrl(null);
    }
  }, [user.avatar]);

  async function onChangeAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      setPreview(URL.createObjectURL(compressedFile));

      const formData = new FormData();
      formData.append('avatar', compressedFile);

      router.post('/profile/avatar', formData, {
        forceFormData: true,
        onSuccess: () => {
          setPreview(null);
          window.location.reload();
        },
        onError: (errors) => {
          console.error('Avatar upload errors:', errors);
        },
      });
    }
  }

  return (
    <div
      className="
        relative
        w-full h-full border border-gray-300 dark:border-gray-700 shadow-md rounded-lg p-4
        bg-yellow-500
        dark:bg-[#7289da]
        text-white dark:text-white
        flex flex-row justify-between items-center gap-8
        transform transition-all duration-300
        hover:scale-[1.02]
        hover:shadow-[0_8px_20px_rgba(255,215,0,0.6)]
        dark:hover:shadow-[0_8px_20px_rgba(115,137,218,0.6)]
        hover:brightness-105 dark:hover:brightness-110
      "
    >
      {/* Left: Avatar and user info */}
      <div className="flex items-center gap-6 flex-1">
        <div className="flex flex-col items-start">
          {/* Avatar and icon */}
          <div className="relative">
            {(preview || avatarUrl) && (
              <img
                src={preview || avatarUrl || undefined}
                alt={`${user.name}'s Avatar`}
                className="w-30 aspect-square rounded-lg object-cover border-4 border-white dark:border-[#424549] shadow cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change avatar"
              />
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={onChangeAvatar}
            />

            {/* Upload icon overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className={`
                p-2 rounded-full
                font-Poppins text-white text-center flex justify-center items-center
                bg-yellow-500
                dark:bg-[#7289da]
                ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                absolute bottom-2 right-2
              `}
              title={processing ? 'Uploading...' : 'Change profile picture'}
            >
              <FaUpload className="text-white w-5 h-5" />
            </button>
          </div>

          {/* Show error if any */}
          {errors.avatar && (
            <p className="text-red-500 text-xs mt-2 font-medium dark:text-red-400">
              {errors.avatar}
            </p>
          )}
        </div>

        {/* User info */}
        <div className="flex flex-col items-start text-left space-y-2 max-w-md">
          <h2 className="text-2xl font-semibold text-white">{user.name}</h2>

          {user.email && (
            <p className="text-sm break-words opacity-90 dark:opacity-80 text-white">{user.email}</p>
          )}

          {user.created_at && (
            <p className="text-xs opacity-80 dark:opacity-70 text-white">
              Joined{' '}
              <span className="font-medium text-white">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
