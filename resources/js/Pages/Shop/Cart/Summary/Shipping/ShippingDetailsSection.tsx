import React, { useEffect } from "react";
import { useShipping } from "@/Contexts/Shop/Cart/ShippingContext";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { usePage } from "@inertiajs/react";
import ArrowIcon from "@/Components/Buttons/ArrowIcon";
import UpdateShippingDetailsForm from "./Components/UpdateShippingDetailsForm";
import AddressSelector from "./Components/AddressSelector";
import ShippingOptions from "./Components/ShippingOptions";

const ShippingDetailsSection: React.FC = () => {
  const {
    shippingDetails,
    rates,
    addresses,
    isShippingOpen, // Using isShippingOpen from the context
    toggleShippingOpen,
    isFormDropdownOpen,
    
    } = useShipping(); // All shipping-related data is managed in the ShippingContext

  const { cart } = useCart(); // Cart data should only be managed by CartContext





  return (
    <>
      <button
        onClick={() => toggleShippingOpen()} // Toggle isShippingOpen state from context
        type="button"
        className="w-full text-sm text-left font-semibold text-gray-800 dark:text-gray-200 flex justify-between items-center"
        aria-expanded={isShippingOpen} // Use isShippingOpen from context
        aria-controls="shipping-details-dropdown"
      >
        Shipping <ArrowIcon w="24" h="24" isOpen={isShippingOpen} />
      </button>

      {isShippingOpen && (
        <div id="shipping-details-dropdown" className="rounded mt-2 dark:text-white">

          <AddressSelector />
          
          {/* Show ShippingOptions if the cart has items and rates are available */}
          {cart.length > 0 && rates.length > 0 && <ShippingOptions />}
        </div>
      )}
    </>
  );
};

export default ShippingDetailsSection;
