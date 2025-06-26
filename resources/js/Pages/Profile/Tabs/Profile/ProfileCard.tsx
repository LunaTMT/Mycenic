import { usePage, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { FaUpload } from 'react-icons/fa';

import DeleteUserForm from '../../Partials/DeleteUserForm';

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

  const { data, setData, post, processing, errors, reset } = useForm<{ avatar: File | null }>({
    avatar: null,
  });

  useEffect(() => {
    if (user.avatar) {
      const isFullUrl = user.avatar.startsWith('http://') || user.avatar.startsWith('https://');
      setAvatarUrl(isFullUrl ? user.avatar : `${user.avatar}`);
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

      setData('avatar', compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.avatar) return;

    post('/profile/avatar', {
      forceFormData: true,
      onSuccess: () => {
        setPreview(null);
        reset('avatar');
        window.location.reload();
      },
      onError: (errors) => {
        console.error('Avatar upload errors:', errors);
      },
    });
  }

  return (
    <div
      className="
        relative
        w-full h-full min-h-[180px] border border-gray-300 dark:border-gray-700 shadow-md rounded-lg p-4
        bg-gradient-to-b from-yellow-300/10 to-yellow-300
        dark:from-[#7289da] dark:to-[#4a5fb3]
        text-black dark:text-white
        flex flex-row justify-between items-center gap-8
      "
    >
      {/* Left side: Avatar and user info grouped */}
      <div className="flex items-center gap-6 flex-1">
        {/* Avatar & upload */}
        <form onSubmit={onSubmit} className="relative flex flex-col items-start">
          {(preview || avatarUrl) && (
            <img
              src={preview || avatarUrl}
              alt={`${user.name}'s Avatar`}
              className="w-40 aspect-square rounded-lg object-cover border-4 border-white dark:border-[#424549] shadow cursor-pointer"
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

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="
              absolute bottom-2 right-2 flex items-center justify-center w-10 h-10
              bg-black/75 rounded-full shadow-md
              hover:bg-black/90
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
            title={processing ? 'Uploading...' : 'Change profile picture'}
          >
            <FaUpload className="text-white w-5 h-5" />
          </button>

          {data.avatar && (
            <button
              type="submit"
              disabled={processing}
              className="
                mt-4 px-6 py-2 bg-green-600 rounded-lg text-white font-semibold shadow-md
                hover:bg-green-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition
              "
            >
              {processing ? 'Uploading...' : 'Upload'}
            </button>
          )}

          {errors.avatar && (
            <p className="text-red-500 text-xs mt-1 font-medium dark:text-red-400">{errors.avatar}</p>
          )}
        </form>

        {/* User info next to avatar */}
        <div className="flex flex-col items-start text-left space-y-2 max-w-md">
          <h2 className="text-2xl font-semibold">{user.name}</h2>

          {user.email && (
            <p className="text-sm break-words opacity-90 dark:opacity-80">{user.email}</p>
          )}

          {user.created_at && (
            <p className="text-xs opacity-80 dark:opacity-70">
              Joined{' '}
              <span className="font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Right bottom corner: DeleteUserForm */}
      <div className="absolute bottom-4 right-4 w-40">
        <DeleteUserForm />
      </div>
    </div>
  );
}
