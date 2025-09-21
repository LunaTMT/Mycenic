import React from 'react';
import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';

import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';

interface GuestSuccessProps {
  order_id: number;
  email: string;
}

const GuestSuccess: React.FC<GuestSuccessProps> = ({ order_id, email }) => {
  console.log(order_id, email);
  return (
    <GuestLayout>
      <div className="relative w-full h-[94vh] flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center items-center space-y-4 p-8 bg-white/50 dark:bg-[#424549]/80 border border-black/20 dark:border-white/20 rounded-lg text-gray-800 dark:text-gray-200 backdrop-blur-sm"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thank you for your order!
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Order <strong>#{order_id}</strong> has successfully been placed.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Confirmation sent to <strong>{email}</strong>
          </p>



          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            

            <PrimaryButton
              onClick={() =>
                router.visit(
                  route('guest.register-or-login', { order_id, email })
                )
              }
            >
              View Order
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    </GuestLayout>
  );
};

export default GuestSuccess;
