import { useEffect, useState, FormEventHandler, useRef } from "react";
import { usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import { load } from "recaptcha-v3";
import { useForm } from "@inertiajs/react";  // Ensure this import is correct
import Checkbox from "@/Components/Login/Checkbox";
import InputError from "@/Components/Login/InputError";
import InputLabel from "@/Components/Login/InputLabel";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import TextInput from "@/Components/Login/TextInput";
import SocialLoginComponent from "../SocialLoginComponent";
import ItemDisplay from "@/Components/Swiper/ItemDisplay";
import { useUser } from "@/Contexts/UserContext";
import Modal from "@/Components/Modal/Modal";  // Ensure Modal is imported

export default function Login({
  status,
  canResetPassword,
}: {
  status?: string;
  canResetPassword: boolean;
}) {
  const { flash } = usePage().props as { flash?: { error?: string } };
  const redirectParam = new URLSearchParams(window.location.search).get("redirect") || "/";
  const { setUser } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Setup form using useForm hook from Inertia
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    remember: false,
    "g-recaptcha-response": "",
    redirect: redirectParam,
  });

  // Handle reCAPTCHA load and setting token
  useEffect(() => {
    load(import.meta.env.VITE_NOCAPTCHA_SITEKEY).then((recaptcha) => {
      recaptcha.execute("login").then((token) => {
        setData("g-recaptcha-response", token);
      });
    });
  }, []);

  // Handle form submission
  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("login"), {
      onError: (errs) => {
        console.error("Login errors:", errs);
      },
      onSuccess: (page) => {
        const loggedInUser = page.props.auth?.user;
        if (loggedInUser) {
          setUser(loggedInUser);
        }
        console.log("Login successful:", page);
      },
    });
  };

  return (
    // Full-Screen Main container
    
      <div className="relative z-10 flex w-full h-full  rounded-xl shadow-2xl overflow-hidden  flex-col sm:flex-row">


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
                  onChange={(e) => setData("email", e.target.value)}
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
                  onChange={(e) => setData("password", e.target.value)}
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
                  onChange={(e) => setData("remember", e.target.checked)}
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
              onClick={() => Inertia.visit(route("register"))}
            >
              Create Account
            </SecondaryButton>
            {true && ( //canResetPassword
              <SecondaryButton
                className="w-1/2 p-3"
                onClick={() => Inertia.visit(route("password.request"))}
              >
                Forgot your password?
              </SecondaryButton>
            )}
          </div>
        </div>
      </div>
    
  );
}
