import React, { useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { useShipping } from "@/Contexts/Shop/Cart/ShippingContext"; // Import the context

const AddressSelector: React.FC = () => {
  const { 
    addresses, 
    shippingDetails, 
    setShippingDetails, 
    toggleDropdown, 
    fetchShippingRates
  } = useShipping(); // Access context

  if (addresses.length === 0) {
    return null; // Do not render anything if there are no addresses
  }

  useEffect(() => {
    // If there's no shippingDetails, set the first address as default
    if (!shippingDetails && addresses.length > 0) {
      setShippingDetails(addresses[0]);
    }
  }, [addresses, shippingDetails, setShippingDetails]);



  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    const selectedAddr = addresses[index];
    console.log("add : ", selectedAddr);
    console.log("changing address");
    setShippingDetails(selectedAddr); // Set the selected address directly as shipping details
    fetchShippingRates();

  };

  return (
    <div className="mb-4 w-full max-w-full">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="select-address" className="text-sm font-medium">
          Select Shipping Address
        </label>
        <button
          onClick={toggleDropdown} // Use toggleDropdown here
          type="button"
          aria-label="Add new address"
          className="w-8 h-8 rounded-full bg-yellow-500 dark:bg-[#7289da] flex justify-center items-center text-white font-medium hover:scale-[103%] transition-all duration-300"
        >
          <FiPlus size={20} />
        </button>
      </div>
      <select
        id="select-address"
        onChange={handleSelect}
        value={shippingDetails ? addresses.indexOf(shippingDetails) : ""}
        className="w-full truncate p-2 text-sm border bg-white dark:bg-[#424549] border-gray-300 dark:border-white/30 rounded dark:text-white"
      >
        {addresses.map((addr, i) => (
          <option key={i} value={i} className="truncate">
            {`${addr.address}, ${addr.city}, ${addr.zip}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AddressSelector;
