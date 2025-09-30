import { FormEventHandler, useState } from "react";
import { router } from "@inertiajs/react";
import Checkbox from "@/Components/Login/Checkbox";
import InputError from "@/Components/Login/InputError";
import InputLabel from "@/Components/Login/InputLabel";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import TextInput from "@/Components/Login/TextInput";
import SocialLoginComponent from "./SocialLoginComponent";
import { load } from "recaptcha-v3";
import { useUser } from "@/Contexts/User/UserContext";
import { User } from "@/types/User";

interface LoginProps {
  onSuccess?: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const { setUser } = useUser();

  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
    redirect: window.location.pathname,
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [processing, setProcessing] = useState(false);

  const getRecaptchaToken = async (action: string) => {
    const recaptcha = await load(import.meta.env.VITE_NOCAPTCHA_SITEKEY);
    return recaptcha.execute(action);
  };

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const token = await getRecaptchaToken("login");

      router.post(
        "/login",
        {
          email: data.email,
          password: data.password,
          remember: data.remember,
          redirect: data.redirect,
          "g-recaptcha-response": token,
        },
        {
          onSuccess: (page) => {
            const loggedInUser = page.props.auth.user as User;
            setUser(loggedInUser);

            // ✅ Call the onSuccess callback to close modal
            onSuccess?.();
          },
          onError: (err) => setErrors(err),
          onFinish: () => setProcessing(false),
        }
      );
    } catch (err) {
      console.error(err);
      setErrors({ email: "Login failed. Please try again." });
      setProcessing(false);
    }
  };

  return (
    <div className="relative z-10 flex w-full h-full rounded-xl shadow-2xl overflow-hidden flex-col sm:flex-row">
      <div className="w-full p-8 flex flex-col justify-center">
        <form onSubmit={submit} className="w-full flex flex-col gap-4">
          <h2 className="text-3xl font-bold text-left dark:text-white">LOGIN</h2>
          <div className="space-y-4">
            <div>
              <InputLabel htmlFor="email" value="Email" />
              <TextInput
                id="email"
                type="email"
                name="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
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
                onChange={(e) => setData({ ...data, password: e.target.value })}
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
                onChange={(e) => setData({ ...data, remember: e.target.checked })}
              />
              <span className="ml-2 text-sm text-black dark:text-white">Remember me</span>
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
            onClick={() => router.visit("/register")}
          >
            Create Account
          </SecondaryButton>

          <SecondaryButton
            className="w-1/2 p-3"
            onClick={() => router.visit("/password/request")}
          >
            Forgot your password?
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
