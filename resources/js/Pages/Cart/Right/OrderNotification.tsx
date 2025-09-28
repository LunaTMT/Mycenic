import React, { useState, useEffect, useRef } from "react";
import InputLabel from "@/Components/Login/InputLabel";
import TextInput from "@/Components/Login/TextInput";
import InputError from "@/Components/Login/InputError";
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { useUser } from "@/Contexts/User/UserContext";
import PhoneNumberDropdown from "@/Components/Dropdown/PhoneNumberDropdown";
import { motion, AnimatePresence } from "framer-motion";

const OrderNotification: React.FC = () => {
  const { user, setUserEmail, setUserPhone } = useUser();

  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  // 🔹 Auto-open dropdown on first mount
  useEffect(() => {
    const timer = setTimeout(() => setDropdownOpen(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 🔹 Initialize email/phone when user becomes available
  useEffect(() => {
    if (user) {
      if (user.email === undefined || user.email === null) setUserEmail("");
      if (user.phone === undefined || user.phone === null) setUserPhone("");
    }
  }, [user, setUserEmail, setUserPhone]);

  if (!user) return null;

  return (
    <div className="space-y-4">
      <button
        onClick={toggleDropdown}
        className="w-full text-sm mb-2 text-left font-semibold text-gray-800 dark:text-gray-200 flex justify-between"
      >
        Order Updates
        <ArrowIcon w="24" h="24" isOpen={dropdownOpen} />
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            key="orderNotificationDropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div>
              <InputLabel htmlFor="email" value="Email" />
              <TextInput
                id="email"
                type="email"
                className="mt-1 block w-full"
                value={user.email || ""}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="you@example.com"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Receive order updates via email.
              </p>
              <InputError className="mt-2 dark:text-red-400" message={errors?.email} />
            </div>

            <div>
              <InputLabel htmlFor="phone" value="Phone" />
              <div className="mt-1">
                <PhoneNumberDropdown
                  value={user.phone || ""}
                  onChange={setUserPhone}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Receive order updates via SMS.
              </p>
              <InputError className="mt-2 dark:text-red-400" message={errors?.phone} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderNotification;
