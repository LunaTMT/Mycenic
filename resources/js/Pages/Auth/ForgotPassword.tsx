import { useEffect, useRef, FormEventHandler } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Head, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/Login/InputLabel';
import TextInput from '@/Components/Login/TextInput';
import InputError from '@/Components/Login/InputError';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import Breadcrumb from '@/Components/Nav/Breadcrumb';
import Swal from 'sweetalert2';

export default function ForgotPassword({ status }: { status?: string }) {
  const { flash } = usePage().props as { flash?: { error?: string } };
  const { data, setData, post, processing, errors } = useForm({
    email: '',
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (flash?.error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: flash.error,
        confirmButtonColor: '#d33',
      });
    }
  }, [flash]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('password.email'));
  };

  return (
    <GuestLayout
      header={
        <div className="h-[5vh] w-full flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: 'HOME', link: route('home') },
              { label: 'LOGIN', link: route('login') },
              { label: 'FORGOT PASSWORD' },
            ]}
          />
        </div>
      }
    >
      <Head title="Forgot Password" />

      <div className="relative w-full h-[89vh] flex justify-center items-center">
        {/* Video as background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
          >
            <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Forgot Password Form */}
        <form
          onSubmit={submit}
          className="w-full max-w-md bg-white dark:bg-[#424549] text-black dark:text-white dark:border-white/20 rounded-xl flex flex-col items-center shadow-2xl relative p-8 space-y-4"
        >
          <div className="w-full space-y-2">
            <h2 className="text-2xl font-bold font-Poppins text-left">FORGOT PASSWORD</h2>
            <p className="text-sm dark:text-white">Enter your email address to receive a password reset link.</p>
          </div>

          {status && (
            <div className="text-sm font-medium text-green-600 dark:text-green-400 w-full">{status}</div>
          )}

          <div className="w-full space-y-4">
            <div>
              <InputLabel htmlFor="email" value="Email" />
              <TextInput
                id="email"
                type="email"
                name="email"
                value={data.email}
                className="mt-1 w-full"
                isFocused
                autoComplete="username"
                onChange={(e) => setData('email', e.target.value)}
              />
              <InputError message={errors.email} className="mt-2" />
            </div>

            <PrimaryButton className="w-full" disabled={processing}>
              Email Password Reset
            </PrimaryButton>
          </div>
        </form>
      </div>
    </GuestLayout>
  );
}
