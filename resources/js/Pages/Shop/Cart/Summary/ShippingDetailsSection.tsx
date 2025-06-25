import React, { useEffect, useState } from 'react';
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { usePage } from "@inertiajs/react";
import axios from 'axios';
import { MdEdit } from "react-icons/md";
import ArrowIcon from '@/Components/Buttons/ArrowIcon';
import GetDetails from '../Shipping/GetShippingDetails';

const ShippingDetailsSection: React.FC = () => {
  const {
    shippingDetails,
    setShippingDetails,
    cart,
    rates,
    fetchShippingEstimate,
    fetchShippingRates,
    selectedShippingRate,
    setSelectedShippingRate,
    setShippingCost,
  } = useCart();

  const user = usePage().props.auth;
  const [editing, setEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    axios.get(route('user.has.shipping.address'))
      .then(({ data }) => {
        if (data.hasShippingAddress) {
          axios.get(route('user.shipping.address'))
            .then(res => setShippingDetails(res.data))
            .catch(err => console.error('Failed to fetch shipping address:', err));
        }
      })
      .catch(err => console.error('Failed to check shipping address status:', err));
  }, [user]);

  useEffect(() => {
    if (shippingDetails && cart.length > 0) {
      fetchShippingRates();
    } else {
      fetchShippingEstimate();
    }
  }, [shippingDetails, cart]);

  useEffect(() => {
    if (shippingDetails && rates.length > 0) {
      let minIndex = 0;
      let minValue = parseFloat(rates[0].amount);

      rates.forEach((r, i) => {
        const amt = parseFloat(r.amount);
        if (amt < minValue) {
          minValue = amt;
          minIndex = i;
        }
      });

      setSelectedShippingRate(minIndex);
      setShippingCost(minValue);
    }
  }, [shippingDetails, rates]);

  const handleShippingOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setSelectedShippingRate(index);
    setShippingCost(parseFloat(rates[index].amount));
  };
  console.log(editing);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  if (!shippingDetails) {
    return(
        <GetDetails />
    )
  }

  return (
    <>
      <button
        onClick={toggleDropdown}
        type="button"
        className="w-full text-sm text-left font-semibold text-gray-800 dark:text-gray-200 flex justify-between items-center"
        aria-expanded={isDropdownOpen}
        aria-controls="shipping-details-dropdown"
      >
        Shipping <ArrowIcon w="24" h="24" isOpen={isDropdownOpen} />
      </button>

      {isDropdownOpen && (
        <div id="shipping-details-dropdown" className="rounded bg-white dark:bg-[#2c2f33] dark:text-white mt-2 ">
          <div className="flex justify-between items-center ">
            
            
            <h2 className="text-md font-semibold">Address</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                type="button"
                className="flex items-center gap-1 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
              >
                <span>Edit</span>
                <MdEdit className="w-4 h-4" />
              </button>
            )}
          </div>

          {editing ? (
            <GetDetails onFinish={() => setEditing(false)} onCancel={() => setEditing(false)} />
          ) : (
            <>
              <div className="text-sm  mb-4">
                {shippingDetails.name}<br />
                {shippingDetails.address}<br />
                {shippingDetails.city}, {shippingDetails.zip}<br />
                {shippingDetails.email}
              </div>

              {cart.length > 0 && (
                <div className="">
                  <label htmlFor="shipping-option" className="text-md font-semibold">Options</label>
                  <select
                    id="shipping-option"
                    className="w-full p-2 text-sm border border-gray-300 dark:border-white/30 rounded bg-white dark:bg-[#2c2f33] dark:text-white"
                    onChange={handleShippingOptionChange}
                    value={selectedShippingRate}
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
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ShippingDetailsSection;
