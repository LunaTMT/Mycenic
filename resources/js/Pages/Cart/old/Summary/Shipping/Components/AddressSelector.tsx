import React, { useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { useShipping } from "@/Contexts/Shop/Cart/ShippingContext";
import UpdateShippingDetailsForm from "./UpdateShippingDetailsForm";

const AddressSelector: React.FC = () => {
  // Destructure state and functions from the shipping context
  const {
    addresses,
    shippingDetails,
    setShippingDetails,
    toggleDropdown,
    fetchShippingRates,
    isFormDropdownOpen, // This should be managed in the ShippingContext
  } = useShipping();

  // When the component mounts or addresses change, set the default shipping address
  useEffect(() => {
    if (!shippingDetails && addresses.length > 0) {
      setShippingDetails(addresses[0]);
    }
  }, [addresses, shippingDetails, setShippingDetails]);

  // Handle selection change in the dropdown
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    const selectedAddr = addresses[index];
    console.log("add : ", selectedAddr);
    console.log("changing address");
    setShippingDetails(selectedAddr); // Update selected shipping address
    fetchShippingRates(); // Trigger new shipping rate fetch
  };

  console.log(isFormDropdownOpen);
  return (
    <div className="w-full max-w-full space-y-4">
      {/* Header row: label + add address button */}
      <div className="flex justify-between items-center ">
        <label htmlFor="select-address" className="text-sm font-medium">
          Addresses
        </label>
        <button
          onClick={toggleDropdown} // Toggle form to add a new address
          type="button"
          aria-label="Add new address"
          className="w-6 h-6 rounded-full bg-yellow-500 dark:bg-[#7289da] flex justify-center items-center text-white font-medium hover:scale-[103%] transition-all duration-300"
        >
          <FiPlus size={20} />
        </button>
      </div>

      {/* Render select + address details only if there are addresses */}
      {addresses.length > 0 && (
        <>
          {/* Address selection dropdown */}
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

          {/* Conditionally show the address form dropdown */}
          {isFormDropdownOpen && <UpdateShippingDetailsForm />}

          {/* Show currently selected shipping address details */}
          {shippingDetails && (
            <div className="p-3 border rounded border-black/20 dark:border-white/20">
              <h3 className="text-lg font-semibold">Shipping Address Details</h3>

              {/* Render address, split across lines if comma-separated */}
              <p className="text-sm mt-2">
                {shippingDetails.address.split(",").map((part, index) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < shippingDetails.address.split(",").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>

              {/* Additional address details */}
              <p className="text-sm">{shippingDetails.city}</p>
              <p className="text-sm">{shippingDetails.zip}</p>
              {shippingDetails.email && <p className="text-sm">{shippingDetails.email}</p>}
              {shippingDetails.phone && <p className="text-sm">{shippingDetails.phone}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddressSelector;
