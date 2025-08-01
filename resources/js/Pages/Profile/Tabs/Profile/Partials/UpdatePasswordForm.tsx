import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/Login/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section
            className={`rounded-lg shadow-md   w-1/2  border dark:border-white/20 border-black/20 p-4  ${className}`}
        >


            <form onSubmit={updatePassword} className="space-y-4">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                    />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full "
                        autoComplete="current-password"
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-2 dark:text-red-400"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="New Password"
                    />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full "
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password}
                        className="mt-2 dark:text-red-400"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full "
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2 dark:text-red-400"
                    />
                </div>

                <div className="flex items-center gap-4 ">
                    <PrimaryButton className="rounded-lg py-2 px-6" disabled={processing}>
                        UPDATE
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-slate-300">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}