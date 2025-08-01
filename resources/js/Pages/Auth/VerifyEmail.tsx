import { useEffect, useRef, FormEventHandler } from 'react';
import Swal from 'sweetalert2';
import { Head, useForm } from '@inertiajs/react';

import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import Breadcrumb from '@/Components/Nav/Breadcrumb';
import ItemDisplay from '@/Components/Swiper/ItemDisplay';  // Import ItemDisplay

export default function VerifyEmail({ status }: { status?: string }) {
  const { post, processing } = useForm({});
  const videoRef = useRef<HTMLVideoElement>(null);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('verification.send'));
  };

  useEffect(() => {
    if (status === 'verification-link-sent') {
      Swal.fire({
        icon: 'success',
        title: 'Verification email sent',
        text: 'A new verification link has been sent to your email address.',
        timer: 3000,
        showConfirmButton: false,
      });
    }
  }, [status]);

  return (
    <GuestLayout>
      <Head title="Email Verification" />

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

      {/* Foreground Content */}
      <div className="relative w-full min-h-[95vh] max-w-7xl flex justify-center items-center mx-auto sm:px-6 lg:px-8 p-5 font-Poppins">
        <div className="relative z-10 flex w-full bg-white/80 dark:bg-[#424549]/80 border border-black/20 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden">
          {/* Swiper Image Gallery on Left */}
          <div className="w-[55%] hidden md:block relative">
            <ItemDisplay />
          </div>

          {/* Right Side */}
          <div className="w-[45%] p-8 flex flex-col">
            {/* Breadcrumb pinned at top */}
            <div className="">
              <Breadcrumb
                items={[
                  
                  { label: 'LOGIN', link: route('login') },
                  { label: 'EMAIL VERIFICATION' },
                ]}
              />
            </div>

            {/* Content vertically centered */}
            <div className="flex flex-col flex-1 justify-center space-y-4">
              <h2 className="text-3xl font-bold font-Poppins text-left dark:text-white">
                EMAIL VERIFICATION
              </h2>

              <h3 className="text-xl font-semibold dark:text-white">Thank you for signing up!</h3>

              <p className="text-sm dark:text-white">
                Before getting started, please verify your email address by clicking on the link we just emailed to you.
              </p>

              <p className="text-sm dark:text-white">
                If you didn’t receive the email, click the button below to request another.
              </p>

              <form onSubmit={submit} className="flex justify-center">
                <PrimaryButton disabled={processing} className="w-full py-3">
                  Resend Verification Email
                </PrimaryButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
