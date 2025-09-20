import { FaFacebookF, FaTwitter } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import Checkbox from '@/Components/Login/Checkbox';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import TextInput from '@/Components/Login/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { load } from 'recaptcha-v3';
import SocialLoginComponent from '../SocialLoginComponent';
import ItemDisplay from '@/Components/Swiper/ItemDisplay';
import { useUser } from '@/Contexts/UserContext';

export default function Login({
  status,
  canResetPassword,
}: {
  status?: string;
  canResetPassword: boolean;
}) {
  const { flash } = usePage().props as { flash?: { error?: string } };
  const redirectParam = new URLSearchParams(window.location.search).get('redirect') || '/';
  const { setUser } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
    'g-recaptcha-response': '',
    redirect: redirectParam,
  });

  useEffect(() => {
    load(import.meta.env.VITE_NOCAPTCHA_SITEKEY).then((recaptcha) => {
      recaptcha.execute('login').then((token) => {
        setData('g-recaptcha-response', token);
      });
    });
  }, []);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route('login'), {
      onError: (errs) => {
        console.error('Login errors:', errs);
      },
      onSuccess: (page) => {
        const loggedInUser = page.props.auth?.user;
        if (loggedInUser) {
          setUser(loggedInUser);
        }
        console.log('Login successful:', page);
      },
    });
  };

  return (
    <GuestLayout>
      <Head title="Log in" />

      {/* Background Video */}
      <div className="w-full h-[94vh] relative">
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

        {/* Main container over video */}
        <div className="relative z-10 w-full min-h-[94vh] max-w-7xl flex justify-center items-center mx-auto sm:px-6 lg:px-8 p-5 font-Poppins">
          <div className="relative z-10 flex w-full bg-white/80 dark:bg-[#424549]/60 border border-black/20 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden ">
            <div className="w-[55%] hidden md:block relative">
              <ItemDisplay />
            </div>
            

            {/* Login Form Right */}
            <div className="w-full p-8 flex flex-col justify-center">
              <form onSubmit={submit} className="w-full flex flex-col gap-4">
                <h2 className="text-3xl font-bold text-left dark:text-white">
                  LOGIN
                </h2>

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
                      type="password"
                      name="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      autoComplete="current-password"
                      className="mt-1 w-full"
                      isPasswordField
                    />
                    <InputError message={errors.password} className="mt-2" />
                  </div>

                  <div className="flex items-center">
                    <Checkbox
                      name="remember"
                      checked={data.remember}
                      onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-black dark:text-white">
                      Remember me
                    </span>
                  </div>

                  <input type="hidden" name="redirect" value={data.redirect} />

                  <PrimaryButton className="w-full p-3" disabled={processing}>
                    Sign in
                  </PrimaryButton>

                  <SocialLoginComponent action="login" />
                </div>
              </form>

              <div className="mt-6 flex gap-4">

                <SecondaryButton
                  className="w-1/2 p-3"
                  onClick={() => Inertia.visit(route('register'))}
                >
                  Create Account
                </SecondaryButton>
                {canResetPassword && (
                  <SecondaryButton
                    className="w-1/2 p-3"
                    onClick={() => Inertia.visit(route('password.request'))}
                  >
                    Forgot your password?
                  </SecondaryButton>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
