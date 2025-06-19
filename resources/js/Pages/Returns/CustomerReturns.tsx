import { useRef, useState, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";
import Breadcrumb from "@/Components/Nav/Breadcrumb";
import ReturnTable from "./Table/ReturnTable";
import { useReturnContext, ReturnProvider } from "@/Contexts/ReturnContext";
import type { ReturnType } from "@/Contexts/ReturnContext";

type CustomerReturnsProps = {
  returns: ReturnType[];
};

export default function CustomerReturns({ returns }: CustomerReturnsProps) {
  const { props } = usePage();
  const auth = props.auth;
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [searchId, setSearchId] = useState("");
  console.log("CUSTOMER RETURNS", returns);
  return (
    <ReturnProvider initialReturns={returns}>
      <Layout
        header={
          <div className="h-[5vh] z-10 w-full overflow-visible flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="w-1/3 h-full flex justify-start">
              <Breadcrumb items={[{ label: "ACCOUNT" }, { label: "RETURNS" }]} />
            </div>
            <div className="w-2/3 h-full flex gap-4 justify-end">
              {auth?.user?.role === "admin" && (
                <input
                  type="text"
                  placeholder="Search by Return ID"
                  className="pl-2 max-w-64 w-full h-[80%] rounded border border-gray-400 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              )}
            </div>
          </div>
        }
      >
        <video
          ref={videoRef}
          className="fixed top-0 left-0 w-full h-screen object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 dark:text-gray-300 flex gap-5 justify-center items-start font-Poppins">
          <ReturnContent searchId={searchId} />
        </div>
      </Layout>
    </ReturnProvider>
  );
}

function ReturnContent({ searchId }: { searchId: string }) {
  const { returns } = useReturnContext();

  const filteredReturns = useMemo(() => {
    if (!searchId.trim()) return returns;
    return returns.filter((r) =>
      r.order_id.toString().toLowerCase().includes(searchId.toLowerCase()) ||
      r.id.toString().toLowerCase().includes(searchId.toLowerCase())
    );
  }, [returns, searchId]);

  if (!filteredReturns.length) {
    return (
      <p className="w-full h-full p-5 overflow-hidden rounded-xl shadow-lg border border-black/20 bg-white dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 text-lg">
        No returns found.
      </p>
    );
  }

  return <ReturnTable returns={filteredReturns} />;
}
