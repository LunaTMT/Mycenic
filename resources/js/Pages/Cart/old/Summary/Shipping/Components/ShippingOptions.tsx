import React, { useEffect } from "react";
import { useShipping } from "@/Contexts/Shop/Cart/ShippingContext";

const ShippingOptions: React.FC = () => {
  const { rates, selectedShippingRate, setSelectedShippingRate, setShippingCost } = useShipping();

  useEffect(() => {
    if (rates.length > 0 && !selectedShippingRate) {
      console.log("Rates", rates);
      const firstRate = rates[0]; // Get the first rate's full details
      setSelectedShippingRate(firstRate);
      setShippingCost(parseFloat(firstRate.amount)); // Set the shipping cost
    }
  }, [rates, selectedShippingRate, setSelectedShippingRate, setShippingCost]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value, 10);
    const selectedRate = rates[selectedIndex]; // Get the full shipping rate details
    console.log(selectedRate);
    setSelectedShippingRate(selectedRate);
    setShippingCost(parseFloat(selectedRate.amount)); // Set the shipping cost
  };

  return (
    <div className="mt-4">
      <label htmlFor="shipping-option" className="text-md font-semibold">
        Shipping Options
      </label>
      <select
        id="shipping-option"
        className="w-full p-2 text-sm border border-gray-300 bg-white dark:bg-[#424549] dark:border-white/30 rounded"
        value={selectedShippingRate ? selectedShippingRate.id : ""}
        onChange={handleShippingChange}
      >
        {rates.map((rate, index) => (
          <option key={index} value={rate.id}>
            {rate.service} — £{parseFloat(rate.amount).toFixed(2)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ShippingOptions;
