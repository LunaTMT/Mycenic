import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ResetPassword({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    token: token,
    email: email,
    password: '',
    password_confirmation: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route('password.store'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <GuestLayout>
      <Head title="Reset Password" />

      <div className="flex justify-center h-screen w-full max-w-7xl items-center py-10 sm:px-6 lg:px-8 gap-8">
        <div className="w-full h-[40vh] border border-black/20 dark:border-white/20 rounded-xl overflow-hidden flex items-center justify-between shadow-2xl">
          
          {/* Left: Video */}
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
            >
              <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Centered Image */}
            <div className="z-10">
              <img
                src="/assets/images/logo2.png"
                alt="Mycenic Logo"
                className="max-w-xs w-full object-cover rounded-full shadow-[0_0_15px_5px_rgba(245,245,220,0.8)] hover:shadow-[0_0_25px_15px_rgba(245,245,220,1)] transition-shadow duration-500"
                style={{ animation: 'shadowPulse 5s ease-in-out infinite' }}
              />
            </div>
          </div>

          {/* Right: Form */}
          <div className="w-full max-w-lg">
            <form onSubmit={submit} className="w-full flex flex-col p-8 gap-2 dark:bg-[#424549]">
              <h2 className="text-2xl font-bold font-Poppins text-left dark:text-white">
                Reset Password
              </h2>

              <div className="space-y-4">
                <div >
                  <InputLabel htmlFor="email" value="Email" />
                  <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    disabled // Make email field immutable
                    autoComplete="username"
                    className="mt-1 w-full"
                  />
                  <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="password" value="Password" />
                  <TextInput
                    id="password"
                    type="password"
                    name="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="new-password"
                    isFocused
                    className="mt-1 w-full"
                  />
                  <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                  <TextInput
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full"
                  />
                  <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <PrimaryButton className="w-full" disabled={processing}>
                    Reset Password
                  </PrimaryButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
