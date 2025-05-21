  import React, { useEffect, useState } from 'react';
  import { useCart } from "@/Contexts/CartContext"; 
  import { router } from "@inertiajs/react";
  import { FaInfoCircle } from "react-icons/fa";
  import Dropdown from '@/Components/Dropdown/Dropdown';
  import { MdEdit } from "react-icons/md";
  import { usePage } from '@inertiajs/react';
  
  import axios from 'axios';




  const ShippingDetailsSection: React.FC = () => {
    const {
      shippingDetails,
      setShippingDetails,
      rates,
      shippingCostEstimate,
      setShippingCost,
      cart,
      fetchShippingEstimate,
      fetchShippingRates
    } = useCart();

    const [selectedRateIndex, setSelectedRateIndex] = useState(0);

    const { props } = usePage();
    const user = props.auth;

    useEffect(() => {
      if (!user) return;

      axios.get(route('user.has.shipping.address'))
        .then(({ data }) => {
          if (data.hasShippingAddress) {
            axios.get(route('user.shipping.address'))
              .then(res => {
                setShippingDetails(res.data);
              })
              .catch(err => {
                console.error('Failed to fetch shipping address:', err);
              });
          }
        })
        .catch(err => {
          console.error('Failed to check shipping address status:', err);
        });
    }, [user]);


    // Whenever we have details + items, fetch the real rates
    useEffect(() => {
      if (shippingDetails && cart.length > 0) {
        fetchShippingRates();
      } else {
        fetchShippingEstimate();
      }
    }, [shippingDetails, cart]);

    // When rates arrive, pick the cheapest
    useEffect(() => {
      if (shippingDetails && rates.length > 0) {
        // find index of minimum amount
        let minIndex = 0;
        let minValue = parseFloat(rates[0].amount);
        rates.forEach((r, i) => {
          const amt = parseFloat(r.amount);
          if (amt < minValue) {
            minValue = amt;
            minIndex = i;
          }
        });

        setSelectedRateIndex(minIndex);
        setShippingCost(minValue);
      }
    }, [shippingDetails, rates, setShippingCost]);

    const handleShippingOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const index = parseInt(e.target.value, 10);
      setSelectedRateIndex(index);
      setShippingCost(parseFloat(rates[index].amount));
    };

    return (
      <div className="mb-4">
        {shippingDetails ? (
          <>
            {/* Address header + edit */}
            <div className="flex justify-between gap-2 items-center mb-3">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Shipping Address
              </h2>
              <button
                onClick={() => router.get(route('cart.get.shipping.details'))}
                className="flex items-center gap-1 text-black dark:text-white hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
              >
                <span>Edit</span>
                <MdEdit className="w-4 h-4" />
              </button>
            </div>

            {/* Address details */}
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {shippingDetails.name}<br />
              {shippingDetails.address}<br />
              {shippingDetails.city}, {shippingDetails.zip}<br />
              {shippingDetails.email}
            </div>

            {/* If we have items, show rates dropdown */}
            {cart.length > 0 && (
              <>
                <label
                  htmlFor="shipping-option"
                  className="block mt-4 mb-1 text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  Shipping Option
                </label>
                <select
                  id="shipping-option"
                  className="w-full p-2 border border-gray-300 dark:border-white/30 rounded bg-white dark:bg-[#2c2f33] dark:text-white"
                  onChange={handleShippingOptionChange}
                  value={selectedRateIndex}
                >
                  {rates.length > 0 ? (
                    rates.map((rate, index) => (
                      <option key={index} value={index}>
                        {rate.service} — £{parseFloat(rate.amount).toFixed(2)}
                      </option>
                    ))
                  ) : (
                    <option value="-1">No shipping options available</option>
                  )}
                </select>
              </>
            )}
          </>
        ) : (
          /* Estimated cost before details */
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Estimated Delivery & Handling
              </span>
              <Dropdown onOpenChange={()=>{}}>
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
      </div>
    );
  };

  export default ShippingDetailsSection;
