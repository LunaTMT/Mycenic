import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { ToastContainer, toast } from 'react-toastify';

import Authenticated from "@/Layouts/AuthenticatedLayout";
import Guest from "@/Layouts/GuestLayout";

import VideoPlayer from "@/Components/Video/VideoPlayer";
import CustomerReviews from "./CustomerReviews";
import Products from "./Products";

import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";

import "react-toastify/dist/ReactToastify.css";

interface WelcomeProps {
  laravelVersion: string;
  phpVersion: string;
  flash?: {
    success?: string;
    error?: string;
  };
}

const Welcome: React.FC<WelcomeProps> = () => {
  const { auth } = usePage().props as { auth: { user: any } };
  const Layout = auth?.user ? Authenticated : Guest;


  return (
    <Layout>
      <Head title="Welcome" />
        <div>
        <VideoPlayer src="/assets/videos/time_lapse.mp4"  />
        </div>



    </Layout>
  );
};

export default Welcome;
