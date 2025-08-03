import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Address } from '@/types/types';

interface ShippingContextType {
  addresses: Address[];
  selectedAddress: Address | null;
  hoveredId: number | null;
  showForm: boolean;

  setAddresses: (addresses: Address[]) => void;
  setSelectedAddress: (address: Address) => void;
  setHoveredId: (id: number | null) => void;
  setShowForm: (show: boolean) => void;
  toggleShowForm: () => void;

  fetchAddresses: () => void;
  
  addAddress: (address: { address: string; city: string; zip: string }) => Promise<void>;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export const ShippingProvider = ({
  user,
  children,
}: {
  user: any;  // Replace 'any' with your User type if you have one
  children: ReactNode;
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const initializedSelectedAddress = useRef(false);

  const toggleShowForm = () => {
    setShowForm(prev => !prev);
  };

  useEffect(() => {
    if (!initializedSelectedAddress.current) return;

    if (selectedAddress) {
      localStorage.setItem('selectedAddressId', selectedAddress.id.toString());
    } else {
      localStorage.removeItem('selectedAddressId');
    }
  }, [selectedAddress]);

  const fetchAddresses = async (userId?: number) => {
    if (!userId && addresses.length > 0) {
      // If no userId provided and addresses are already loaded, skip fetching
      console.log('Addresses already loaded, skipping fetch');
      return;
    }

    try {
      const url = userId ? `/profile/addresses?user_id=${userId}` : '/profile/addresses';
      console.log(`Fetching addresses from: ${url}`);
      const res = await axios.get(url);
      setAddresses(res.data);

      if (res.data.length === 0) {
        setSelectedAddress(null);
        localStorage.removeItem('selectedAddressId');
        initializedSelectedAddress.current = true;
        return;
      }

      const savedId = localStorage.getItem('selectedAddressId');
      if (savedId) {
        const savedAddress = res.data.find(
          (addr: Address) => addr.id === parseInt(savedId)
        );
        if (savedAddress) {
          setSelectedAddress(savedAddress);
          initializedSelectedAddress.current = true;
          return;
        }
      }

      setSelectedAddress(res.data[0]);
      initializedSelectedAddress.current = true;
    } catch (error) {
      toast.error('Failed to load addresses');
      initializedSelectedAddress.current = true;
    }
  };

  const addAddress = async (addressData: {
    address: string;
    city: string;
    zip: string;
  }) => {
    try {
      const res = await axios.post('/profile/addresses', addressData);
      const newAddress: Address = res.data;

      // Add new address to existing list without refetching
      setAddresses(prev => [...prev, newAddress]);
      setSelectedAddress(newAddress);
      setShowForm(false);
      toast.success('Address added successfully');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const messages = Object.values(error.response.data.errors).flat();
        messages.forEach(msg => toast.error(msg));
      } else {
        toast.error('Failed to add address');
      }
    }
  };

  useEffect(() => {
    // Reset and fetch addresses when user changes
    initializedSelectedAddress.current = false;
    setAddresses([]);
    setSelectedAddress(null);
    fetchAddresses(user.id);
  }, [user]);

  return (
    <ShippingContext.Provider
      value={{
        addresses,
        selectedAddress,
        hoveredId,
        showForm,
        setAddresses,
        setSelectedAddress,
        setHoveredId,
        setShowForm,
        toggleShowForm,
        fetchAddresses,
        addAddress,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context)
    throw new Error('useShipping must be used within a ShippingProvider');
  return context;
};
