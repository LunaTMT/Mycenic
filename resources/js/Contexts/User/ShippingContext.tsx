import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Address, ShippingRate } from '@/types/Shipping';
import { useCart } from '../Shop/Cart/CartContext';
import { useUser } from './UserContext';
import Cart from '@/Pages/Cart/Cart';

interface ShippingContextType {
  addresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: React.Dispatch<React.SetStateAction<Address | null>>;
  rates: ShippingRate[];
  selectedRate: ShippingRate | null;
  setSelectedRate: React.Dispatch<React.SetStateAction<ShippingRate | null>>;
  loadingRates: boolean;
  errorRates: string | null;
  shippingCost: number;
  setShippingCost: (amount: number) => void;
  hoveredId: number | null;
  showForm: boolean;
  toggleShowForm: () => void;
  fetchRates: () => Promise<void>;
  storeAddress: (detail: Address) => Promise<void>;
  updateAddress: (id: number, updatedDetail: Partial<Address>) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

interface ShippingProviderProps {
  children: ReactNode;
}

export const ShippingProvider: React.FC<ShippingProviderProps> = ({ children }) => {
  const { cart, totalWeight } = useCart();
  const { user } = useUser(); // Fetch user details

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(false);
  const [errorRates, setErrorRates] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleShowForm = () => setShowForm((prev) => !prev);

  useEffect(() => {
    // Retrieve addresses from localStorage if available
    const savedAddresses = localStorage.getItem('addresses');
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
  }, []);

  useEffect(() => {
    // Update the addresses whenever user changes
    if (user && !user.isGuest) {
      setAddresses(user.addresses || []);
      setSelectedAddress(user.addresses?.find((address) => address.is_default) || null);
    } else {
      setAddresses([]);  // Clear addresses if user is guest
    }
  }, [user]);  // Re-run when user object changes

  useEffect(() => {
    // Persist addresses in localStorage whenever they change
    if (addresses.length > 0) {
      localStorage.setItem('addresses', JSON.stringify(addresses));
    }
  }, [addresses]);

  useEffect(() => {
    // Persist shipping cost in localStorage
    localStorage.setItem('shippingCost', shippingCost.toString());
  }, [shippingCost]);

  // Fetch shipping rates when selected address changes
  useEffect(() => {
    if (selectedAddress) {
      fetchRates();
    }
  }, [selectedAddress]); // This will run fetchRates whenever selectedAddress changes

  const fetchRates = async () => {
    if (!selectedAddress) {
      setRates([]);
      setSelectedRate(null);
      setShippingCost(0); // Reset shipping cost if no address
      return;
    }

    setLoadingRates(true);
    setErrorRates(null);

    try {
      const response = await axios.post("/shipping/rates", {
        address: selectedAddress.address_line1,
        city: selectedAddress.city,
        zip: selectedAddress.zip,
        weight: totalWeight || 1,
      });

      setRates(response.data.rates || []);
      setSelectedRate(null);
      setShippingCost(0);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch shipping rates";
      setErrorRates(message);
      setRates([]);
      setSelectedRate(null);
      setShippingCost(0);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    if (selectedRate) {
      setShippingCost(parseFloat(selectedRate.amount)); // Update shipping cost when rate changes
    }
  }, [selectedRate]);

  const updateAddressList = async () => {
    if (user && !user.isGuest) {
      try {
        const res = await axios.get(`/addresses`);
        setAddresses(res.data);
        setSelectedAddress(res.data.find(d => d.is_default) || null);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to fetch addresses');
      }
    } else {
      setAddresses(prev => [...prev]);
    }
  };

  const storeAddress = async (detail: Address) => {
    if (user && !user.isGuest) {
      try {
        await axios.post(`/addresses`, detail);
        updateAddressList();
        setShowForm(false);
        toast.success('Shipping detail added successfully');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to add shipping detail');
        throw err;
      }
    } else {
      const newId = addresses.length ? Math.max(...addresses.map(d => d.id)) + 1 : 1;
      const newDetail = { ...detail, id: newId, is_default: true };
      const updated = addresses.map(d => ({ ...d, is_default: false })).concat(newDetail);
      setAddresses(updated);
      setSelectedAddress(newDetail); // Ensure selected address is updated
      setShowForm(false);
      toast.success('Shipping detail added successfully');
    }
  };

  const updateAddress = async (id: number, detail: Partial<Address>) => {
    if (user && !user.isGuest) {
      try {
        // Update backend
        await axios.put(`/addresses/${id}`, detail);
        updateAddressList(); // Refresh address list after update
        setShowForm(false);
        toast.success('Shipping detail updated successfully');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to update shipping detail');
        throw err;
      }
    } else {
      const updated = addresses.map(d => (d.id === id ? { ...d, ...detail } : d));
      setAddresses(updated);
      setSelectedAddress(updated.find(d => d.id === id) || null);
      setShowForm(false);
      toast.success('Shipping detail updated successfully');
    }
  };

  const deleteAddress = async (id: number) => {
    const updated = addresses.filter(d => d.id !== id);
    setAddresses(updated);

    if (selectedAddress?.id === id) {
      setSelectedAddress(updated[0] || null);
    }

    if (user && !user.isGuest) {
      try {
        await axios.delete(`/addresses/${id}`);
        toast.success('Shipping detail deleted successfully');
      } catch {
        toast.error('Failed to delete shipping detail');
      }
    }
  };

  return (
    <ShippingContext.Provider
      value={{
        addresses,
        selectedAddress,
        setSelectedAddress,
        rates,
        selectedRate,
        setSelectedRate,
        loadingRates,
        errorRates,
        shippingCost,
        setShippingCost,
        hoveredId,
        showForm,
        toggleShowForm,
        fetchRates,
        storeAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error('useShipping must be used within a ShippingProvider');
  }
  return context;
};
