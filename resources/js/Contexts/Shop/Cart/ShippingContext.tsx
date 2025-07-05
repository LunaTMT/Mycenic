import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '@/Contexts/Shop/Cart/CartContext'; // Assuming this hook is available in your app
import { router } from "@inertiajs/react";

// TYPES
// Define the structure for shipping details and shipping rates
export interface ShippingDetails {
  id: string;
  address: string;
  city: string;
  zip: string;
  name?: string;  // New field for full name
  email?: string; // New field for email address
  phone?: string; // New field for phone number
}

export interface ShippingRate {
  id: string;
  object_id: string; // Add object_id here
  amount: string;
  provider: string;
  service: string;
}

// CONTEXT TYPE
// Define the context and its structure
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

// CONTEXT CREATION
// Create the context for the Shipping functionality
const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

// CUSTOM HOOK
// Custom hook to use the Shipping Context
export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error('useShipping must be used within a ShippingProvider');
  }
  return context;
};

// PROVIDER COMPONENT
// The provider that wraps your app to provide the shipping context
export const ShippingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // STATE MANAGEMENT
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
  const [selectedShippingRate, setSelectedShippingRate] = useState<ShippingRate | null>(() => {
    const savedShippingRate = localStorage.getItem('selectedShippingRate');
    if (savedShippingRate) {
      try {
        return JSON.parse(savedShippingRate);
      } catch (e) {
        console.error('Error parsing selected shipping rate from localStorage:', e);
        return null;
      }
    }
    return null;
  });
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

  const [isFormDropdownOpen, setIsFormDropdownOpen] = useState<boolean>(true);
  const [isShippingOpen, setIsShippingOpen] = useState<boolean>(false);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);
  const { cart, total, subtotal, weight, promoDiscount, clearCart } = useCart();

  // EFFECT HOOKS
  // UseEffect for loading addresses when the component is mounted
  useEffect(() => {
    loadAddresses();
  }, []);

  // LOGGING SELECTED SHIPPING RATE
  useEffect(() => {
    if (selectedShippingRate) {
      console.log('Selected Shipping Rate changed:', selectedShippingRate);
    }
  }, [selectedShippingRate]);

  // FUNCTIONS

  // Load addresses from localStorage or API
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

  // Add a new address
  const addAddress = (address: ShippingDetails, cartLength: number) => {
    setAddresses((prev) => {
      const addressExists = prev.some(
        (addr) =>
          addr.address === address.address &&
          addr.city === address.city &&
          addr.zip === address.zip &&
          addr.name === address.name &&  // Ensure name is checked
          addr.email === address.email && // Ensure email is checked
          addr.phone === address.phone    // Ensure phone is checked
      );

      if (addressExists) {
        toast.warn('This address already exists.');
        return prev;
      }

      const updatedAddresses = [...prev, address];
      localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
      setShippingDetails(address); // Make sure shippingDetails is updated with all fields
      localStorage.setItem('shippingDetails', JSON.stringify(address)); // Save all fields to localStorage
      toast.success('Address added.');
      if (cartLength > 0) {
        fetchShippingRates();
      }

      return updatedAddresses;
    });
  };

  // Update an existing address
  const updateAddress = (address: ShippingDetails) => {
    setAddresses((prev) => {
      const updatedAddresses = prev.map((addr) =>
        addr.id === address.id ? address : addr
      );
      localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
      return updatedAddresses;
    });
  };

  // Remove an address
  const removeAddress = (addressId: string) => {
    setAddresses((prev) => {
      const updatedAddresses = prev.filter((addr) => addr.id !== addressId);
      localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
      return updatedAddresses;
    });
  };

  // Fetch shipping rates from the API
  const fetchShippingRates = async () => {
    console.log("Fetching rates");
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

  // Create an order
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

    // Prepare shipping details and selected shipping rate for the order
    const shippingDetailsObject = {
      id: shippingDetails.id,
      address: shippingDetails.address,
      city: shippingDetails.city,
      zip: shippingDetails.zip,
      name: shippingDetails.name, // Include name
      email: shippingDetails.email, // Include email
      phone: shippingDetails.phone, // Include phone
    };

    const selectedShippingRateObject = {
      amount: selectedShippingRate.amount,
      provider: selectedShippingRate.provider,
      service: selectedShippingRate.service,
    };

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

    // Proceed with router visit after validation
    router.visit(route("checkout.process"), {
      method: "post",
      data,
      onFinish: () => {
        setAddresses([]);  // Optionally reset addresses
        clearCart();
        console.log("Cart has been emptied.");
      },
    });
  };

  const toggleShippingOpen = () => {
    if (isShippingOpen && shippingDetails) {
      setIsFormDropdownOpen(false);  // Set dropdown to false if shipping is closed
    }
    setIsShippingOpen((prev) => !prev);  // Toggle the shipping open state
  };

  const toggleDropdown = () => {
    console.log("toggleDropdown has been called");
    setIsFormDropdownOpen((prev) => !prev);
  };

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
        toggleDropdown,
        isShippingOpen,
        setIsShippingOpen,
        toggleShippingOpen,
        loadingAddresses,
        createOrder,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};
