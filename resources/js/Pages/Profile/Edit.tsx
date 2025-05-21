import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

import Breadcrumb from '@/Components/Nav/Breadcrumb';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UpdateShippingDetailsForm from './Partials/UpdateShippingDetailsForm';


export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {

    const sections = [
        {
            title: "Update Profile Information",
            component: <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />,
        },
        {
            title: "Update Password",
            component: <UpdatePasswordForm />,
        },
        {
            title: "Update Shipping Details",
            component: <UpdateShippingDetailsForm />,
        },

        {
            title: "Delete Account",
            component: <DeleteUserForm />,
        },
    ];

    const [openIndex, setOpenIndex] = useState<number>(-1);

    return (
        <AuthenticatedLayout
            header={
                <div className="h-[5vh] z-10 w-full overflow-visible flex justify-between items-center gap-4">
                    <Breadcrumb
                        items={[
                            { label: "ACCOUNT" },
                            { label: "PROFILE" },
                        ]}
                    />
                </div>
            }
        >
            <Head title="Profile" />

            {/* Background Video */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Main Content */}
            <div className="relative w-full h-full py-5">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-4 font-Poppins">
                    {sections.map((section, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={index}
                                className="rounded-md bg-white dark:bg-[#424549]  dark:border-white/20 border border-black/20 shadow-2xl"
                            >
                                <button
                                    onClick={() =>
                                        setOpenIndex(isOpen ? -1 : index)
                                    }
                                    className="w-full flex justify-between items-center px-8 py-2  text-left text-lg font-semibold dark:text-white"
                                >
                                    <span>{section.title}</span>
                                    <ChevronUpIcon
                                        className={`w-10 h-10 transform transition-transform duration-200 ${
                                            isOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="content"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="w-full pl-8 p-4">
                                                {section.component}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
