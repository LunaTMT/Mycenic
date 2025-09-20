import { useEffect, useRef, FormEventHandler } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Head, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/Login/InputLabel';
import TextInput from '@/Components/Login/TextInput';
import InputError from '@/Components/Login/InputError';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';

import Breadcrumb from '@/Components/Nav/Breadcrumb';
import ItemDisplay from '@/Components/Swiper/ItemDisplay';

export default function ForgotPassword({ status }: { status?: string }) {
  const { flash } = usePage().props as { flash?: { error?: string } };

  const { data, setData, post, processing, errors } = useForm({
    email: '',
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (flash?.error) {
      console.error('Forgot Password Error:', flash.error);
    }
  }, [flash]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('password.email'));
  };

  return (
    <GuestLayout>
      <Head title="Forgot Password" />

      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
        >
          <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Main container */}
      <div className="relative w-full min-h-[95vh] max-w-7xl flex justify-center items-center mx-auto sm:px-6 lg:px-8 p-5 font-Poppins">
        <div className="relative z-10 flex w-full bg-white/80 dark:bg-[#424549]/60 border border-black/20 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden">
          {/* Image Gallery Left */}
          <div className="w-[55%] hidden md:block relative">
            <ItemDisplay />
          </div>

          {/* Form Right */}
          <div className="w-[45%] p-8 flex flex-col">
            {/* Breadcrumb at the very top, no vertical centering */}
            <div className="">
              <Breadcrumb
                items={[
                  { label: 'LOGIN', link: route('login') },
                  { label: 'FORGOT PASSWORD' },
                ]}
              />
            </div>

            {/* The rest of the form vertically centered */}
            <form onSubmit={submit} className="flex flex-col gap-4 flex-1 justify-center">
              <h2 className="text-3xl font-bold font-Poppins text-left dark:text-white">
                FORGOT PASSWORD
              </h2>
              <p className="text-sm text-left dark:text-white">
                Enter your email address to receive a password reset link.
              </p>

              {status && (
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  {status}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <InputLabel htmlFor="email" value="Email" />
                  <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    autoComplete="username"
                    className="mt-1 w-full"
                  />
                  <InputError message={errors.email} className="mt-2" />
                </div>

                <PrimaryButton className="w-full p-3" disabled={processing}>
                  Email Password Reset
                </PrimaryButton>
              </div>
            </form>


          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
