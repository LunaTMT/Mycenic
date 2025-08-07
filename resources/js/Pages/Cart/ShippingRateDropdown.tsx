import React, { useState } from "react";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { useShipping } from "@/Contexts/Shop/Cart/ShippingContext";

export const ShippingRateDropdown: React.FC = () => {
  const {
    rates,
    selectedRate,
    setSelectedRate,
    fetchRates,
    loadingRates,
    errorRates,
    selectedAddress,
  } = useShipping();

  const [open, setOpen] = useState(false);

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);

    // Fetch rates when opening dropdown
    if (isOpen && selectedAddress) {
      await fetchRates();
    }
  };

  return (
    <div className="w-40 mb-6">
      <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
        Shipping Option
      </label>

      <Dropdown onOpenChange={handleOpenChange}>
        <Dropdown.Trigger>
          <div
            className="w-80 px-3 py-1 border rounded-md text-left cursor-pointer flex justify-between items-center text-sm text-gray-900 dark:text-white dark:bg-[#424549]/80 border-black/20 dark:border-white/20"
          >
            <span className="truncate">
              {selectedRate
                ? `${selectedRate.provider} - ${selectedRate.service} (£${selectedRate.amount})`
                : loadingRates
                ? "Loading rates..."
                : "Choose a shipping option"}
            </span>
            <ArrowIcon isOpen={open} />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          {errorRates ? (
            <div className="text-red-500 px-4 py-2 text-sm">
              {errorRates}
            </div>
          ) : (
            <ul className="w-80 bg-white dark:bg-[#424549] shadow-lg z-50 rounded-md border border-gray-300 dark:border-gray-600 text-sm">
              {rates.map((rate, i) => (
                <li
                  key={rate.id}
                  onClick={() => {
                    setSelectedRate(rate);
                    setOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-[#7289da]/70 ${
                    selectedRate?.id === rate.id ? "font-semibold" : ""
                  } ${i === 0 ? "rounded-t-md" : ""} ${
                    i === rates.length - 1 ? "rounded-b-md" : ""
                  }`}
                >
                  {rate.provider} - {rate.service} (£{rate.amount})
                </li>
              ))}
              {rates.length === 0 && !loadingRates && (
                <li className="px-4 py-2 text-gray-500 dark:text-gray-300 italic">
                  No shipping options available
                </li>
              )}
            </ul>
          )}
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
};
