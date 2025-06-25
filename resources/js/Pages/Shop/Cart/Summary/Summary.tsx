import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import ShippingDetailsSection from "./ShippingDetailsSection";
import PromoCodeSection from "./PromoCodeSection";
import PaymentPage from "../Payment/PaymentPage";
import { FaInfoCircle } from "react-icons/fa";
import Dropdown from "@/Components/Dropdown/Dropdown";
import axios from "axios";

const Summary: React.FC<{ auth: any }> = ({ auth }) => {
  const {
    promoDiscount,
    discountAmount,
    subtotal,
    total,
    cart,
    shippingDetails,
    shippingCostEstimate,
    shippingCost,
  } = useCart();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const hasShipping = shippingDetails && shippingCost !== null;

  const handleProceed = async () => {
    if (!shippingDetails) {
      router.get(route("cart.get.shipping.details"));
      return;
    }

    try {
      const { data } = await axios.post(route("payment.intent"), {
        amount: Math.round(parseFloat(total) * 100),
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
    <div className="rounded-lg font-Poppins border  p-4 border-black/20 bg-white dark:bg-[#424549] dark:border-white/20">
      <h1 className="text-3xl text-black text-left dark:text-white mb-2">Summary</h1>

      <div className="border-t border-gray-300 dark:border-white/50   py-4 relative">
        <ShippingDetailsSection />
      </div>

      <div className="border-t border-gray-300 dark:border-white/50 py-4  relative">
        <PromoCodeSection />
      </div>

      {/* Subtotal */}
      <div className="flex justify-between  border-t border-gray-300 dark:border-white/50 py-4">
        <span className="text-md font-semibold text-gray-800 dark:text-gray-200">Subtotal</span>
        <span className="text-sm font-bold text-black dark:text-white">£{subtotal}</span>
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
          <span className="text-sm font-bold text-green-500">-£{discountAmount}</span>
        </div>
      )}

      {/* Shipping Cost OR Estimate */}
      {shippingDetails ? (
        shippingCost !== null && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center  justify-center">
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
                    Shipping cost is based on your selected shipping option.
                  </div>
                </Dropdown.Content>
              </Dropdown>
            </div>
            <span className="text-sm font-bold text-black dark:text-white">
              £{parseFloat(shippingCost).toFixed(2)}
            </span>
          </div>
        )
      ) : (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Estimated Delivery & Handling
            </span>
            <Dropdown onOpenChange={() => {}}>
              <Dropdown.Trigger>
                <span className="cursor-pointer rounded-full w-5 h-5 flex items-center justify-center text-black dark:text-white">
                  <FaInfoCircle className="w-full h-full" />
                </span>
              </Dropdown.Trigger>
              <Dropdown.Content>
                <div className="relative z-50 w-64 text-xs p-2 rounded bg-black text-white shadow-md">
                  The estimate is based on weight and is subject to change once shipping details are provided.
                </div>
              </Dropdown.Content>
            </Dropdown>
          </div>
          <span className="text-sm font-bold text-black dark:text-white">
            {shippingCostEstimate.length === 2
              ? (shippingCostEstimate[0] === 0 && shippingCostEstimate[1] === 0
                ? '£0.00'
                : `£${shippingCostEstimate[0].toFixed(2)} - £${shippingCostEstimate[1].toFixed(2)}`)
              : '£0.00'}
          </span>
        </div>
      )}

      {/* Total */}
      <div className="border-t text-lg font-semibold border-gray-300 dark:border-white/50 py-2 mt-4 flex justify-between">
        <h1 className=" text-gray-800 dark:text-gray-200">Total</h1>
        <span className=" text-black dark:text-white">
          {hasShipping
            ? `£${parseFloat(total).toFixed(2)}`
            : `£${Math.round(parseFloat(total) + shippingCostEstimate[0])} – £${Math.round(parseFloat(total) + shippingCostEstimate[1])}`}
        </span>
      </div>

      {/* Action */}
      <div className="border-t border-gray-300 dark:border-white/50 pt-4">
        {!clientSecret ? (
          <PrimaryButton
            className="w-full"
            onClick={handleProceed}
            disabled={cart.length === 0 || !shippingDetails}
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
