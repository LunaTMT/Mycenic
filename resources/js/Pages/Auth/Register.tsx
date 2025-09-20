import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import Breadcrumb from '@/Components/Nav/Breadcrumb';
import TextInput from '@/Components/Login/TextInput';
import InputLabel from '@/Components/Login/InputLabel';
import InputError from '@/Components/Login/InputError';
import SocialLoginComponent from './SocialLoginComponent';
import { Inertia } from '@inertiajs/inertia';
import ItemDisplay from '@/Components/Swiper/ItemDisplay';

export default function Register() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    password_confirmation: '',
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <GuestLayout>
      <Head title="Register" />

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
      <div className="relative w-full min-h-[89vh] max-w-7xl flex justify-center items-center mx-auto sm:px-6 lg:px-8 p-5 font-Poppins">
        <div className="relative z-10 flex w-full bg-white/80 dark:bg-[#424549]/80 border border-black/20 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden">
          {/* Image Gallery Left */}
          <div className="w-[55%] hidden md:block relative">
            <ItemDisplay />
          </div>

          {/* Register Form Right */}
          <div className="w-[45%] p-8 flex flex-col">
            {/* Breadcrumb pinned at top */}
            <div className="mb-6">
              <Breadcrumb
                items={[
                  { label: 'LOGIN', link: route('login') },
                  { label: 'REGISTER' },
                ]}
              />
            </div>

            {/* Form content vertically centered */}
            <form onSubmit={submit} className="flex flex-col flex-1 justify-center gap-4 w-full">
              {/* Heading */}
              <h2 className="text-2xl font-bold font-Poppins text-left dark:text-white">
                CREATE ACCOUNT
              </h2>

              {/* Form fields */}
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

                <div>
                  <InputLabel htmlFor="password" value="Password" />
                  <TextInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full"
                  />
                  <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                  <TextInput
                    id="password_confirmation"
                    type={showPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full"
                  />
                  <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center">
                  <input
                    id="showPassword"
                    type="checkbox"
                    checked={showPassword}
                    onChange={togglePasswordVisibility}
                    className="mr-2"
                  />
                  <label htmlFor="showPassword" className="text-sm text-black dark:text-white">
                    Show Password
                  </label>
                </div>

                <PrimaryButton className="w-full p-3" disabled={processing}>
                  Register
                </PrimaryButton>

                <SocialLoginComponent action="register" />
              </div>
            </form>

            {/* Already have account */}
            <div className="w-full pt-4 space-y-2">
              <SecondaryButton
                className="w-full p-3"
                onClick={() => Inertia.visit(route('login'))}
              >
                Already have an account?
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
