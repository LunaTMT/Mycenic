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
import Breadcrumb from '@/Components/Nav/Breadcrumb';
import Swal from 'sweetalert2';
import { Inertia } from '@inertiajs/inertia';
import { load } from 'recaptcha-v3';
import SocialLoginComponent from '../SocialLoginComponent';

export default function Login({
  status,
  canResetPassword,
}: {
  status?: string;
  canResetPassword: boolean;
}) {
  const { flash } = usePage().props as { flash?: { error?: string } };
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
    'g-recaptcha-response': '',
  });

  const videoRef = useRef<HTMLVideoElement>(null);

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
      onError: (errors) => {
        console.error('Login errors:', errors);
      },
      onSuccess: () => {
        console.log('Login successful');
      },
    });
  };



  return (
    <GuestLayout
      header={
        <div className="h-[5vh] w-full flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: 'HOME', link: route('home') },
              { label: 'LOGIN' },
            ]}
          />
        </div>
      }
    >
      <Head title="Log in" />

      {status && (
        <div className="mb-4 text-sm font-medium text-green-600">
          {status}
        </div>
      )}

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

        <div className="relative  w-full max-w-md bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden">
          <form
            onSubmit={submit}
            className="w-f/ flex flex-col p-8 gap-4"
          >
            <h2 className="text-2xl font-bold font-Poppins text-left dark:text-white">
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

              <PrimaryButton className="w-full p-2" disabled={processing}>
                Sign in
              </PrimaryButton>

              <SocialLoginComponent action="login" />
            </div>
          </form>

          <div className="w-full px-8 pb-8 space-y-2">
            {canResetPassword && (
              <SecondaryButton
                className="w-full p-2"
                onClick={() => Inertia.visit(route('password.request'))}
              >
                Forgot your password?
              </SecondaryButton>
            )}
            <SecondaryButton
              className="w-full p-2"
              onClick={() => Inertia.visit(route('register'))}
            >
              Create Account
            </SecondaryButton>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
