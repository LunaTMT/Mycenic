import axios from 'axios';
import { toast } from 'react-toastify';
import { ShippingDetail } from '@/types/Shipping';
import { useUser } from '../UserContext';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ShippingContextType {
  shippingDetails: ShippingDetail[];
  selectedShippingDetail: ShippingDetail | null;
  hoveredId: number | null;
  showForm: boolean;

  setShippingDetails: (shippingDetails: ShippingDetail[]) => void;
  setSelectedShippingDetail: (id: number | null, makeDefault?: boolean) => void;
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

  const [shippingDetails, setShippingDetails] = useState<ShippingDetail[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleShowForm = () => setShowForm(prev => !prev);
  const closeForm = () => setShowForm(false);

  const selectedShippingDetail = shippingDetails.find(d => d.id === selectedShippingId) || null;

  const setSelectedShippingDetail = async (id: number | null) => {
    setSelectedShippingId(id);

    if (id !== null) localStorage.setItem('selectedShippingDetailId', id.toString());
    else localStorage.removeItem('selectedShippingDetailId');

    const detail = shippingDetails.find(d => d.id === id);
    if (detail && !detail.is_default) {
      try {
        // Call the new endpoint to set default only
        await axios.put(`/profile/shipping-details/${id}/default`);
        setShippingDetails(prev => prev.map(d => ({ ...d, is_default: d.id === id })));
        toast.success('Default shipping address updated');
      } catch {
        toast.error('Failed to update default shipping address');
      }
    }
  };

  const fetchShippingDetails = async () => {
    if (user.isGuest) return;
    console.log(user);
    try {
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
  };

  const storeShippingDetail = async (detail: ShippingDetail) => {
    try {
      await axios.post(`/profile/shipping-details?user_id=${user.id}`, detail);
      const res = await axios.get(`/profile/shipping-details?user_id=${user.id}`);
      setShippingDetails(res.data);

      if (res.data.length) {
        const newItem = res.data[res.data.length - 1];
        await setSelectedShippingDetail(newItem.id);
      }

      closeForm();
      toast.success('Shipping detail added successfully');
    } catch (err: any) {
      // Laravel validation errors
      if (err.response?.status === 422) {
        if (err.response.data?.errors) {
          Object.values(err.response.data.errors).flat().forEach(msg => toast.error(msg));
        } else if (err.response.data?.error) {
          // Top-level error like "This shipping address already exists"
          toast.error(err.response.data.error);
        } else {
          toast.error('Failed to add shipping detail');
        }
      } else {
        toast.error('Failed to add shipping detail');
      }

      throw err; // keep form values intact
    }
  };

  const updateShippingDetail = async (id: number, detail: Partial<ShippingDetail>) => {
    try {
      await axios.put(`/profile/shipping-details/${id}`, detail);
      const res = await axios.get(`/profile/shipping-details?user_id=${user.id}`);
      setShippingDetails(res.data);

      await setSelectedShippingDetail(id);

      closeForm();
      toast.success('Shipping detail updated successfully');
    } catch (err: any) {
      if (err.response?.status === 422) {
        if (err.response.data?.errors) {
          // Laravel validation errors
          Object.values(err.response.data.errors).flat().forEach(msg => toast.error(msg));
        } else if (err.response.data?.error) {
          // Top-level error like duplicate
          toast.error(err.response.data.error);
        } else {
          toast.error('Failed to update shipping detail');
        }
      } else {
        toast.error('Failed to update shipping detail');
      }
      throw err; // keep form values intact
    }
  };


  const deleteShippingDetail = async (id: number) => {
    try {
      await axios.delete(`/profile/shipping-details/${id}`);
      const updatedList = shippingDetails.filter(d => d.id !== id);
      setShippingDetails(updatedList);

      if (selectedShippingId === id) {
        setSelectedShippingDetail(updatedList.length ? updatedList[0].id : null, false);
      }

      toast.success('Shipping detail deleted successfully');
    } catch {
      toast.error('Failed to delete shipping detail');
    }
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
