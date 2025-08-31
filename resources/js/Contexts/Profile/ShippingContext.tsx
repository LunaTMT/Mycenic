import axios from 'axios';
import { toast } from 'react-toastify';
import { ShippingDetail } from '@/types/Shipping';
import { useUser } from '../UserContext';
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

interface ShippingContextType {
  shippingDetails: ShippingDetail[];
  selectedShippingDetail: ShippingDetail | null;
  hoveredId: number | null;
  showForm: boolean;

  setShippingDetails: (shippingDetails: ShippingDetail[]) => void;
  setSelectedShippingDetail: (id: number | null) => void;
  setHoveredId: (id: number | null) => void;
  setShowForm: (show: boolean) => void;
  toggleShowForm: () => void;

  fetchShippingDetails: () => void;
  storeShippingDetail: (detail: ShippingDetail) => Promise<void>;
  updateShippingDetail: (id: number, updatedDetail: Partial<ShippingDetail>) => Promise<void>;
  deleteShippingDetail: (id: number) => Promise<void>;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export const ShippingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();

  // Load initial state from localStorage for guests
  const [shippingDetails, setShippingDetails] = useState<ShippingDetail[]>(() => {
    if (!user || user.isGuest) {
      const stored = localStorage.getItem('guestShippingDetails');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [selectedShippingId, setSelectedShippingIdState] = useState<number | null>(() => {
    const savedId = localStorage.getItem('selectedShippingDetailId');
    return savedId ? parseInt(savedId, 10) : null;
  });

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleShowForm = () => setShowForm(prev => !prev);
  const closeForm = () => setShowForm(false);

  // Memoize selected shipping detail for performance
  const selectedShippingDetail = useMemo(
    () => shippingDetails.find(d => d.id === selectedShippingId) || null,
    [shippingDetails, selectedShippingId]
  );

  // Persist guest shipping to localStorage whenever it changes
  useEffect(() => {
    if (!user || user.isGuest) {
      localStorage.setItem('guestShippingDetails', JSON.stringify(shippingDetails));
    }
  }, [shippingDetails, user]);

  const setSelectedShippingDetail = async (id: number | null, updatedList?: ShippingDetail[]) => {
    setSelectedShippingIdState(id);
    if (id !== null) localStorage.setItem('selectedShippingDetailId', id.toString());
    else localStorage.removeItem('selectedShippingDetailId');

    const list = updatedList || shippingDetails;

    if (user && !user.isGuest) {
      const detail = list.find(d => d.id === id);
      if (detail && !detail.is_default) {
        try {
          await axios.put(`/profile/shipping-details/${id}/default`);
          setShippingDetails(prev => prev.map(d => ({ ...d, is_default: d.id === id })));
          toast.success('Default shipping address updated');
        } catch {
          toast.error('Failed to update default shipping address');
        }
      }
    } else {
      // Guests: just update is_default
      setShippingDetails(list.map(d => ({ ...d, is_default: d.id === id })));
    }
  };

  const fetchShippingDetails = async () => {
    if (user && !user.isGuest) {
      try {
        console.log("fetching shipping");
        const res = await axios.get(`/profile/shipping-details?user_id=${user.id}`);
        setShippingDetails(res.data);

        if (!res.data.length) {
          setSelectedShippingDetail(null);
          return;
        }

        const savedId = localStorage.getItem('selectedShippingDetailId');
        const selectedId = savedId && res.data.some(d => d.id === parseInt(savedId, 10))
          ? parseInt(savedId, 10)
          : res.data[0].id;

        setSelectedShippingDetail(selectedId);
      } catch {
        toast.error('Failed to load shipping details');
      }
    } else {
      // For guests, shippingDetails already loaded from localStorage
      const savedId = localStorage.getItem('selectedShippingDetailId');
      const selectedId = savedId && shippingDetails.some(d => d.id === parseInt(savedId, 10))
        ? parseInt(savedId, 10)
        : shippingDetails[0]?.id || null;
      setSelectedShippingDetail(selectedId);
    }
  };

  const storeShippingDetail = async (detail: ShippingDetail) => {
    if (user && !user.isGuest) {
      try {
        await axios.post(`/profile/shipping-details?user_id=${user.id}`, detail);
        const res = await axios.get(`/profile/shipping-details?user_id=${user.id}`);
        setShippingDetails(res.data);

        if (res.data.length) {
          const newItem = res.data[res.data.length - 1];
          await setSelectedShippingDetail(newItem.id, res.data);
        }

        closeForm();
        toast.success('Shipping detail added successfully');
      } catch (err: any) {
        if (err.response?.status === 422) {
          if (err.response.data?.errors) {
            Object.values(err.response.data.errors).flat().forEach(msg => toast.error(msg));
          } else if (err.response.data?.error) {
            toast.error(err.response.data.error);
          } else {
            toast.error('Failed to add shipping detail');
          }
        } else {
          toast.error('Failed to add shipping detail');
        }
        throw err;
      }
    } else {
      const newId = shippingDetails.length ? Math.max(...shippingDetails.map(d => d.id)) + 1 : 1;
      const newDetail = { ...detail, id: newId, is_default: true };
      const updated = shippingDetails.map(d => ({ ...d, is_default: false })).concat(newDetail);
      setShippingDetails(updated);
      setSelectedShippingDetail(newId, updated);
      closeForm();
      toast.success('Shipping detail added successfully');
    }
  };

  const updateShippingDetail = async (id: number, detail: Partial<ShippingDetail>) => {
    if (user && !user.isGuest) {
      try {
        await axios.put(`/profile/shipping-details/${id}`, detail);
        const res = await axios.get(`/profile/shipping-details?user_id=${user.id}`);
        setShippingDetails(res.data);
        await setSelectedShippingDetail(id, res.data);
        closeForm();
        toast.success('Shipping detail updated successfully');
      } catch (err: any) {
        if (err.response?.status === 422) {
          if (err.response.data?.errors) {
            Object.values(err.response.data.errors).flat().forEach(msg => toast.error(msg));
          } else if (err.response.data?.error) {
            toast.error(err.response.data.error);
          } else {
            toast.error('Failed to update shipping detail');
          }
        } else {
          toast.error('Failed to update shipping detail');
        }
        throw err;
      }
    } else {
      const updated = shippingDetails.map(d => (d.id === id ? { ...d, ...detail } : d));
      setShippingDetails(updated);
      setSelectedShippingDetail(id, updated);
      closeForm();
      toast.success('Shipping detail updated successfully');
    }
  };

  const deleteShippingDetail = async (id: number) => {
    const updated = shippingDetails.filter(d => d.id !== id);
    setShippingDetails(updated);

    if (selectedShippingId === id) {
      setSelectedShippingDetail(updated[0]?.id || null, updated);
    }

    if (user && !user.isGuest) {
      try {
        await axios.delete(`/profile/shipping-details/${id}`);
      } catch {
        toast.error('Failed to delete shipping detail');
      }
    }

    toast.success('Shipping detail deleted successfully');
  };

  useEffect(() => {
    fetchShippingDetails();
  }, [user]);

  return (
    <ShippingContext.Provider
      value={{
        shippingDetails,
        selectedShippingDetail,
        hoveredId,
        showForm,
        setShippingDetails,
        setSelectedShippingDetail,
        setHoveredId,
        setShowForm,
        toggleShowForm,
        fetchShippingDetails,
        storeShippingDetail,
        updateShippingDetail,
        deleteShippingDetail,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) throw new Error('useShipping must be used within a ShippingProvider');
  return context;
};
