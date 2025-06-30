import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import ShippingDetailsSection from "./Shipping/ShippingDetailsSection";
import PromoCodeSection from "./PromoCodeSection";
import PaymentPage from "../Payment/PaymentPage";
import { FaInfoCircle } from "react-icons/fa";
import Dropdown from "@/Components/Dropdown/Dropdown";
import axios from "axios";
import { toast } from "react-toastify";
import { useShipping } from "@/Contexts/Shop/Cart/ShippingContext"; // Import from context

const Summary: React.FC<{ auth: any }> = ({ auth }) => {
  const {
    promoDiscount,
    discountAmount,
    subtotal,
    total,
    cart,
  } = useCart();

  // Destructure shipping details and cost from the useShipping context
  const {
    shippingDetails,
    shippingCost,
    setIsFormDropdownOpen,
    setIsShippingOpen
  } = useShipping();

  const [clientSecret, setClientSecret] = useState<string | null>(null);


  const hasShipping = shippingDetails && shippingCost !== null;

  const handleProceed = async () => {
    if (cart.length === 0) {
      toast.info("Your cart is empty.");
      return;
    }

    if (!shippingDetails) {
      setIsShippingOpen(true);
      setIsFormDropdownOpen(true);
      toast.info("Please enter your shipping details before proceeding.");
      return;
    }

    try {
      const amountInCents = Math.round(parseFloat(total) * 100); // Ensure total is parsed as number
      const { data } = await axios.post(route("payment.intent"), {
        amount: amountInCents,
      });

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        console.error("No client secret returned from backend");
      }
    } catch (e) {
      console.error("Failed to fetch payment intent:", e);
    }
  };

  return (
    <div className="rounded-lg font-Poppins border p-4 border-black/20 bg-white dark:bg-[#424549] dark:border-white/20">
      <h1 className="text-3xl text-black text-left dark:text-white mb-2">Summary</h1>

      <div className="border-t border-gray-300 dark:border-white/50 py-4 relative">
        <ShippingDetailsSection  />
      </div>

      <div className="border-t border-gray-300 dark:border-white/50 py-4 relative">
        <PromoCodeSection />
      </div>

      {/* Subtotal */}
      <div className="flex justify-between border-t border-gray-300 dark:border-white/50 py-4">
        <span className="text-md font-semibold text-gray-800 dark:text-gray-200">Subtotal</span>
        <span className="text-sm font-bold text-black dark:text-white">£{parseFloat(subtotal).toFixed(2)}</span>
      </div>

      {/* Discount */}
      {promoDiscount > 0 && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mr-2">
              Discount ({promoDiscount}%)
            </span>
            <Dropdown onOpenChange={() => {}}>
              <Dropdown.Trigger>
                <span className="cursor-pointer rounded-full w-5 h-5 flex items-center justify-center text-black dark:text-white">
                  <FaInfoCircle className="w-full h-full" />
                </span>
              </Dropdown.Trigger>
              <Dropdown.Content>
                <div className="relative z-50 w-64 text-xs p-2 rounded bg-black text-white shadow-md">
                  Discounts apply to the subtotal and excludes delivery & handling fees.
                </div>
              </Dropdown.Content>
            </Dropdown>
          </div>
          <span className="text-sm font-bold text-green-500">-£{parseFloat(discountAmount).toFixed(2)}</span>
        </div>
      )}

      {/* Shipping Cost */}
      {shippingDetails && shippingCost !== null && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mr-2">
              Shipping Cost
            </span>
            <Dropdown onOpenChange={() => {}}>
              <Dropdown.Trigger>
                <span className="cursor-pointer rounded-full w-5 h-5 flex items-center justify-center text-black dark:text-white">
                  <FaInfoCircle className="w-full h-full" />
                </span>
              </Dropdown.Trigger>
              <Dropdown.Content>
                <div className="relative z-50 w-64 text-xs p-2 rounded bg-black text-white shadow-md">
                  The shipping costs are determined by the total weight of your cart.
                </div>
              </Dropdown.Content>
            </Dropdown>
          </div>
          <span className="text-sm font-bold text-black dark:text-white">
            £{parseFloat(shippingCost).toFixed(2)}
          </span>
        </div>
      )}

      {/* Total */}
      {hasShipping && (
        <div className="border-t text-lg font-semibold border-gray-300 dark:border-white/50 py-2 mt-4 flex justify-between">
          <h1 className="text-gray-800 dark:text-gray-200">Total</h1>
          <span className="text-black dark:text-white">
            £{parseFloat(total).toFixed(2)}
          </span>
        </div>
      )}

      {/* Action */}
      <div className="border-t border-gray-300 dark:border-white/50 pt-4">
        {!clientSecret ? (
          <PrimaryButton
            className="w-full"
            onClick={handleProceed}
          >
            Proceed to Payment
          </PrimaryButton>
        ) : (
          <PaymentPage paymentIntentClientSecret={clientSecret} />
        )}
      </div>
    </div>
  );
};

export default Summary;
