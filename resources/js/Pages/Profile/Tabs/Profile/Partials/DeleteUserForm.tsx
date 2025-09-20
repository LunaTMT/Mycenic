import DangerButton from '@/Components/Buttons/DangerButton';
import InputError from '@/Components/Login/InputError';
import InputLabel from '@/Components/Login/InputLabel';
import Modal from '@/Components/Modal/Modal';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import TextInput from '@/Components/Login/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import Swal from 'sweetalert2';

export default function DeleteUserForm({ className = '' }: { className?: string }) {
  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);

  const {
    data,
    setData,
    delete: destroy,
    processing,
    reset,
    errors,
    clearErrors,
  } = useForm({
    password: '',
  });

  const confirmUserDeletion = () => {
    setConfirmingUserDeletion(true);
  };

  const deleteUser: FormEventHandler = (e) => {
    e.preventDefault();
    destroy(route('profile.destroy'), {
      preserveScroll: false,
      onSuccess: () => {},
      onError: () => passwordInput.current?.focus(),
      onFinish: () => reset(),
    });
  };

  const closeModal = () => {
    setConfirmingUserDeletion(false);
    clearErrors();
    reset();
  };

  return (
    <>
      <DangerButton onClick={confirmUserDeletion} className={className}>
        Delete Account
      </DangerButton>

      <Modal show={confirmingUserDeletion} onClose={closeModal}>
        <form onSubmit={deleteUser} className="p-6 flex flex-col items-center text-center">
          <h2 className="text-lg font-medium text-black dark:text-black">
            Are you sure you want to delete your account?
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Once your account is deleted, all of its resources and data will be permanently deleted.
            Please enter your password to confirm you would like to permanently delete your account.
          </p>

          <div className="mt-6 w-full flex flex-col items-center">
            <InputLabel htmlFor="password" value="Password" className="sr-only dark:text-slate-100" />

            <TextInput
              id="password"
              type="password"
              name="password"
              ref={passwordInput}
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              className="block w-full text-center dark:bg-slate-800 text-black border-2 border-black bg-white"
              isFocused
              placeholder="Password"
            />

            <InputError message={errors.password} className="mt-2 dark:text-red-400" />
          </div>

          <div className="mt-6 flex justify-center gap-3 w-full">
            <SecondaryButton onClick={closeModal} className="p-2 rounded-md">
              Cancel
            </SecondaryButton>
            <DangerButton type="submit" disabled={processing}>
              Delete Account
            </DangerButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
