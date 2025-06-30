import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '@/Contexts/Shop/Cart/CartContext'; // Assuming this hook is available in your app
import { router } from "@inertiajs/react";

// Types
export interface ShippingDetails {
  id: string;
  address: string;
  city: string;
  zip: string;
  name?: string;
  email?: string;
}

export interface ShippingRate {
  id: string;
  object_id: string; // Add object_id here
  amount: string;
  provider: string;
  service: string;
}

// Context Type
interface ShippingContextType {
  addresses: ShippingDetails[];
  setAddresses: React.Dispatch<React.SetStateAction<ShippingDetails[]>>;
  addAddress: (address: ShippingDetails, cartLength: number) => void;
  updateAddress: (address: ShippingDetails) => void;
  removeAddress: (addressId: string) => void;
  loadAddresses: () => void;

  shippingDetails: ShippingDetails | null;
  setShippingDetails: React.Dispatch<React.SetStateAction<ShippingDetails | null>>;

  shippingCost: number;
  setShippingCost: React.Dispatch<React.SetStateAction<number>>;
  selectedShippingRate: ShippingRate | null;
  setSelectedShippingRate: React.Dispatch<React.SetStateAction<ShippingRate | null>>;
  rates: ShippingRate[];
  fetchShippingRates: () => Promise<void>;

  isFormDropdownOpen: boolean;
  setIsFormDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDropdown: () => void;

  isShippingOpen: boolean;
  setIsShippingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleShippingOpen: () => void;

  loadingAddresses: boolean;
  createOrder: (paymentIntentId: string, legalAgreement: boolean) => void;
}

// Context
const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

// Custom hook to use the context
export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error('useShipping must be used within a ShippingProvider');
  }
  return context;
};

// Provider Component
export const ShippingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<ShippingDetails[]>(() => {
    const savedAddresses = localStorage.getItem('addresses');
    if (savedAddresses) {
      try {
        return JSON.parse(savedAddresses);
      } catch (e) {
        console.error('Error parsing addresses from localStorage:', e);
        return [];
      }
    }
    return [];
  });

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(() => {
    const savedShippingDetails = localStorage.getItem('shippingDetails');
    if (savedShippingDetails) {
      try {
        return JSON.parse(savedShippingDetails);
      } catch (e) {
        console.error('Error parsing shipping details from localStorage:', e);
        return null;
      }
    }
    return null;
  });

  const [shippingCost, setShippingCost] = useState<number>(0);
  const [selectedShippingRate, setSelectedShippingRate] = useState<ShippingRate | null>(null);
  const [rates, setRates] = useState<ShippingRate[]>(() => {
    const savedRates = localStorage.getItem('shippingRates');
    if (savedRates) {
      try {
        return JSON.parse(savedRates);
      } catch (e) {
        console.error('Error parsing shipping rates from localStorage:', e);
        return [];
      }
    }
    return [];
  });

  const [isFormDropdownOpen, setIsFormDropdownOpen] = useState<boolean>(!shippingDetails);
  const [isShippingOpen, setIsShippingOpen] = useState<boolean>(false);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);
  const { cart, total, subtotal, weight, promoDiscount } = useCart();

  // Load addresses from localStorage or the API
  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const savedAddresses = localStorage.getItem('addresses');
      if (savedAddresses) {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
      } else {
        const { data } = await axios.get(route('user.addresses.index'));
        setAddresses(data);
        localStorage.setItem('addresses', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Logging changes to the selectedShippingRate
  useEffect(() => {
    if (selectedShippingRate) {
      console.log('Selected Shipping Rate changed:', selectedShippingRate);
    }
  }, [selectedShippingRate]);

  const addAddress = (address: ShippingDetails, cartLength: number) => {
    setAddresses((prev) => {
      const addressExists = prev.some(
        (addr) =>
          addr.address === address.address &&
          addr.city === address.city &&
          addr.zip === address.zip
      );

      if (addressExists) {
        toast.warn('This address already exists.');
        return prev;
      }

      const updatedAddresses = [...prev, address];
      localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
      setShippingDetails(address);
      localStorage.setItem('shippingDetails', JSON.stringify(address));
      toast.success('Address added.');
      if (cartLength > 0) {
        fetchShippingRates();
      }

      return updatedAddresses;
    });
  };

  const updateAddress = (address: ShippingDetails) => {
    setAddresses((prev) => {
      const updatedAddresses = prev.map((addr) =>
        addr.id === address.id ? address : addr
      );
      localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
      return updatedAddresses;
    });
  };

  const removeAddress = (addressId: string) => {
    setAddresses((prev) => {
      const updatedAddresses = prev.filter((addr) => addr.id !== addressId);
      localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
      return updatedAddresses;
    });
  };

  const fetchShippingRates = async () => {
    if (!shippingDetails || !shippingDetails.address || !shippingDetails.city || !shippingDetails.zip) {
      console.warn('Shipping details are incomplete');
      return;
    }

    if (cart.length === 0) {
      console.warn('No items in the cart. Shipping rates will not be fetched.');
      return;
    }

    try {
      console.log("Fetching rates...");
      const { data } = await axios.post(route('cart.shipping.rates'), {
        weight: 1, // or use the actual cart weight if available
        address: shippingDetails.address,
        city: shippingDetails.city,
        zip: shippingDetails.zip,
      });
      setRates(data);
      localStorage.setItem('shippingRates', JSON.stringify(data));
    } catch (e) {
      console.error('Error fetching shipping rates:', e);
    }
  };



  const createOrder = (
    paymentIntentId: string,
    legalAgreement: boolean
  ) => {
    console.log("Creating order...");

    // Log the essential data to check what is missing
    console.log("Addresses:", addresses);
    console.log("Cart:", cart);
    console.log("Shipping Details:", shippingDetails);
    console.log("Selected Shipping Rate:", selectedShippingRate);

    // Check if essential data exists
    if (!addresses.length || !cart.length || !shippingDetails || !selectedShippingRate || Object.keys(selectedShippingRate).length === 0) {
      // Log which data is missing
      if (!addresses.length) console.error("Addresses are missing.");
      if (!cart.length) console.error("Cart is missing.");
      if (!shippingDetails) console.error("Shipping details are missing.");
      if (!selectedShippingRate || Object.keys(selectedShippingRate).length === 0) {
        console.error("Selected shipping rate is missing or empty.");
      }

      return;
    }

    // Prepare shipping details as an object
    const shippingDetailsObject = {
      id: shippingDetails.id,
      address: shippingDetails.address,
      city: shippingDetails.city,
      zip: shippingDetails.zip,
    };

    // Prepare the selected shipping rate object
    const selectedShippingRateObject = {
      amount: selectedShippingRate.amount,
      provider: selectedShippingRate.provider,
      service: selectedShippingRate.service,
    };

    // Log the prepared data
    console.log("Shipping Details Object:", shippingDetailsObject);
    console.log("Selected Shipping Rate Object:", selectedShippingRateObject);

    // Prepare the data to be sent to the server
    const data = {
      cart: JSON.stringify(cart),
      total,
      subtotal,
      weight,
      discount: promoDiscount,
      paymentIntentId,
      shippingDetails: shippingDetailsObject,
      shippingCost,
      selectedShippingRate: selectedShippingRateObject,
      legalAgreement,
    };

    // Log the final data to be sent to the server
    console.log("Data to be sent to server:", data);

    // Proceed with router visit after validation
    router.visit(route("checkout.process"), {
      method: "post",
      data,
      onFinish: () => {
        setAddresses([]);  // Optionally reset addresses
        console.log("Cart has been emptied.");
      },
    });
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  return (
    <ShippingContext.Provider
      value={{
        addresses,
        setAddresses,
        addAddress,
        updateAddress,
        removeAddress,
        loadAddresses,
        shippingDetails,
        setShippingDetails,
        shippingCost,
        setShippingCost,
        selectedShippingRate,
        setSelectedShippingRate,
        rates,
        fetchShippingRates,
        isFormDropdownOpen,
        setIsFormDropdownOpen,
        toggleDropdown: () => setIsFormDropdownOpen((prev) => !prev),
        isShippingOpen,
        setIsShippingOpen,
        toggleShippingOpen: () => setIsShippingOpen((prev) => !prev),
        loadingAddresses,
        createOrder,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};
