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
    <GuestLayout
      header={
        <div className="h-[5vh] w-full flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: 'HOME', link: route('home') },
              { label: 'REGISTER' },
            ]}
          />
        </div>
      }
    >
      <Head title="Register" />

      <div className="relative flex justify-center items-center h-[89vh] w-full px-4 sm:px-6 lg:px-8">
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

        <div className="relative w-full max-w-md bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden">
          <form onSubmit={submit} className="w-full flex flex-col p-8 gap-4">
            <h2 className="text-2xl font-bold font-Poppins text-left dark:text-white">
              CREATE ACCOUNT
            </h2>

            <div className="space-y-4">
              <div className='space-y-1'>
                {/* Email */}
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

                {/* Password */}
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

                {/* Confirm Password */}
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
              </div>

              {/* Show Password */}
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

              {/* Register Button */}
              <PrimaryButton className="w-full" disabled={processing}>
                Register
              </PrimaryButton>

              {/* Social Login */}
              <SocialLoginComponent action="register" />
            </div>
          </form>

          <div className="w-full px-8 pb-8 space-y-2">
            <SecondaryButton
              className="w-full"
              onClick={() => Inertia.visit(route('login'))}
            >
              Already have an account?
            </SecondaryButton>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
