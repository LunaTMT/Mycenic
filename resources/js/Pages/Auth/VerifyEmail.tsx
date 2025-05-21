import { useEffect, useRef, FormEventHandler } from 'react';
import Swal from 'sweetalert2';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import Breadcrumb from '@/Components/Nav/Breadcrumb';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});
    const videoRef = useRef<HTMLVideoElement>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    useEffect(() => {
        if (status === 'verification-link-sent') {
            Swal.fire({
                icon: 'success',
                title: 'Verification email sent',
                text: 'A new verification link has been sent to your email address.',
                timer: 3000,
                showConfirmButton: false,
            });
        }
    }, [status]);

    return (
        <GuestLayout
            header={
                <div className="h-[5vh] z-10 w-full flex justify-between items-center gap-4">
                    <Breadcrumb
                        items={[
                            { label: 'HOME', link: route('home') },
                            { label: 'LOGIN',  },
                            { label: 'EMAIL VERIFICATION' },
                        ]}
                    />
                </div>
            }
        >
            <Head title="Email Verification" />

            <div className="relative flex justify-center items-center h-full w-full px-4 sm:px-6 lg:px-8 min-h-[89vh]">
                {/* Background Video */}
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
                
                {/* Foreground Content */}
                <div className="relative z-10 space-y-4 w-full max-w-lg bg-white/90 dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-xl shadow-2xl p-8">
                    
                     <h2 className="text-2xl font-bold font-Poppins text-left">EMAIL VERIFICATION</h2>
                    <h2 className="text-xl  font-bold font-Poppins text-left dark:text-white">
                         Thank you for signing up!
                    </h2>
                    <p>
                        Before getting started, please verify your email address by clicking on the link we just emailed to you.</p>
                   
                    <p>
                        If you didn't receive the email, click the button below to request another.</p>   
       
                    <form onSubmit={submit} className=" flex justify-center">
                        <PrimaryButton disabled={processing} className='w-full'>
                            Resend Verification Email
                        </PrimaryButton>
                    </form>

                 
                </div>
            </div>
        </GuestLayout>
    );
}
