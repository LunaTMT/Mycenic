import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowIcon from '@/Components/Icon/ArrowIcon';
import countries from '@/utils/countries_phone';
import { useUser } from '@/Contexts/User/UserContext';

const PhoneNumberDropdown: React.FC = () => {
  const { user } = useUser();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Autofill phone number from user if available
  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set country based on saved code or IP, but only once
  useEffect(() => {
    const savedCountryCode = localStorage.getItem('countryCode');
    if (savedCountryCode) {
      const matchedCountry = countries.find(c => c.code === savedCountryCode);
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        return;
      }
    }

    const fetchCountryByIP = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const countryCode = data.country_code; // ISO Alpha-2

        const matchedCountry = countries.find(c => c.code === countryCode);
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          localStorage.setItem('countryCode', matchedCountry.code);
        }
      } catch (err) {
        console.error('Failed to fetch country by IP:', err);
      }
    };

    fetchCountryByIP();
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex border-1 border-black/20 dark:border-white/20 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center px-3 bg-gray-100 dark:bg-[#1e2124]/60 cursor-pointer"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="ml-2 text-gray-900 dark:text-white">{selectedCountry.dialCode}</span>
          <ArrowIcon w="16" h="16" isOpen={isOpen} />
        </button>
        <input
          type="tel"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
          className="flex-1 px-3 py-2 outline-none text-gray-900 dark:text-white bg-white dark:bg-[#1e2124]/60"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-1 w-full bg-white dark:bg-[#424549] shadow-lg rounded-md border border-gray-300 dark:border-white/20 z-50 max-h-60 overflow-y-auto pointer-events-auto scrollable"
          >
            {countries.map(country => (
              <div
                key={country.code}
                onClick={() => {
                  setSelectedCountry(country);
                  localStorage.setItem('countryCode', country.code); // save selection
                  setIsOpen(false);
                }}
                className="cursor-pointer px-4 py-2 flex items-center hover:bg-gray-200 dark:hover:bg-[#7289da]/70"
              >
                <span className="text-lg">{country.flag}</span>
                <span className="ml-2 flex-1 text-gray-900 dark:text-white">{country.label}</span>
                <span className="text-gray-500 dark:text-gray-300">{country.dialCode}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneNumberDropdown;
