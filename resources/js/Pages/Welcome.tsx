import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { ToastContainer, toast } from 'react-toastify';

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";

import VideoPlayer from "@/Components/Video/VideoPlayer";
import CustomerReviews from "./Home/CustomerReviews";
import Products from "./Home/Products";

import { useDarkMode } from "@/Contexts/DarkModeContext";
import "react-toastify/dist/ReactToastify.css";
import TrustpilotWidget from "@/Components/Widgets/TrustPilot";

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
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  const { darkMode } = useDarkMode();

  return (
    <Layout>
      <Head title="Welcome" />
      
      <VideoPlayer src="/assets/videos/time_lapse.mp4" className="w-full h-[94vh] relative" />
      
      <Products />
      <CustomerReviews />


    </Layout>
  );
};

export default Welcome;
